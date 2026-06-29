const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const savedRoutes = require('./routes/saved');
const redis = require('redis');

// ─── CACHE SETUP ─────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
const requestTimestamps = new Map();

let redisClient = null;
let isRedisConnected = false;

(async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    const isTLS = redisUrl.startsWith('rediss://');

    redisClient = redis.createClient({
      url: redisUrl,
      socket: isTLS ? { tls: true, rejectUnauthorized: false } : undefined
    });

    redisClient.on('error', (err) => {
      console.warn('Redis client error, falling back to local cache:', err.message);
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('Redis connected successfully');
      isRedisConnected = true;
    });

    await redisClient.connect();
  } catch (err) {
    console.warn('Redis connection failed, falling back to local cache:', err.message);
    isRedisConnected = false;
  }
})();


const app = express();
const allowedOrigins = ['https://newzapp-nine.vercel.app', 'http://localhost:3000'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json()); // needed for POST body parsing
// MongoDB connection
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/saved', savedRoutes);
const historyRoutes = require('./routes/history');
app.use('/api/history', historyRoutes);

const User = require('./models/User');

// ─── TRENDING API ────────────────────────────────────────
// Query param: ?range=24h | 7d | all   (default: 7d)
app.get('/api/trending', async (req, res) => {
  try {
    const range = req.query.range || '7d';
    const now = Date.now();
    const rangeMs = range === '24h' ? 24 * 60 * 60 * 1000
      : range === '7d' ? 7 * 24 * 60 * 60 * 1000
        : null; // 'all' = no cutoff

    const users = await User.find({}, 'readHistory');

    const categoryCount = {};
    const articleCount = {};
    const wordCount = {};
    const wordArticleSet = {};
    let totalReadsInRange = 0;
    let mostRecentRead = null;

    const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were', 'be', 'been', 'has', 'have', 'had',
      'it', 'its', 'this', 'that', 'these', 'those', 'as', 'up', 'out', 'about', 'into', 'after',
      'he', 'she', 'they', 'we', 'you', 'i', 'his', 'her', 'their', 'our', 'my', 'new', 'says',
      'will', 'could', 'would', 'should', 'may', 'can', 'not', 'no', 'what', 'how', 'who', 'when',
      'than', 'more', 'over', 'said', 'before', 'during', 'while', 'just', 'also', 'one', 'two',
      'amid', 'set', 'top', 'why', 'now']);

    for (const user of users) {
      for (const article of (user.readHistory || [])) {
        const readAt = article.readAt ? new Date(article.readAt).getTime() : null;

        if (rangeMs !== null) {
          if (!readAt || (now - readAt) > rangeMs) continue;
        }

        if (readAt && (!mostRecentRead || readAt > mostRecentRead)) {
          mostRecentRead = readAt;
        }

        totalReadsInRange++;

        const category = (article.category || 'general').toLowerCase();
        categoryCount[category] = (categoryCount[category] || 0) + 1;

        const key = article.title;
        if (key) {
          articleCount[key] = {
            count: ((articleCount[key]?.count) || 0) + 1,
            title: article.title,
            source: article.source?.name || 'Unknown',
            url: article.url,
            category,
          };
        }

        const words = (article.title || '')
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .split(/\s+/)
          .filter(w => w.length > 3 && !stopwords.has(w.toLowerCase()));

        const seenInThisTitle = new Set();
        for (const rawWord of words) {
          const word = rawWord.toLowerCase();
          if (seenInThisTitle.has(word)) continue;
          seenInThisTitle.add(word);

          wordCount[word] = (wordCount[word] || 0) + 1;
          if (!wordArticleSet[word]) wordArticleSet[word] = new Set();
          if (key) wordArticleSet[word].add(key);
        }
      }
    }

    const trendingTopics = Object.entries(wordCount)
      .filter(([word, count]) => count >= 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word, count]) => ({ word, count, articleSpread: wordArticleSet[word].size }));

    const categoryTrends = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));

    const hotArticles = Object.values(articleCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      trendingTopics,
      categoryTrends,
      hotArticles,
      totalReads: totalReadsInRange,
      range,
      lastUpdated: mostRecentRead ? new Date(mostRecentRead).toISOString() : null,
    });

  } catch (err) {
    console.error('Trending error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
// ─── NEWS API ───────────────────────────────────────────────
async function fetchFromGNews(url, apiKey) {
  const finalUrl = url.replace('TOKEN_PLACEHOLDER', apiKey);
  const response = await fetch(finalUrl);
  const data = await response.json();
  return { response, data };
}

app.get('/api/news', async (req, res) => {
  const { country, category, q, page } = req.query;
  const primaryKey = process.env.GNEWS_API_KEY;
  const backupKey = process.env.GNEWS_API_KEY_2;

  const cacheKey = JSON.stringify(req.query);

  let cachedData = null;
  if (isRedisConnected && redisClient) {
    try {
      const val = await redisClient.get(cacheKey);
      if (val) {
        cachedData = JSON.parse(val);
      }
    } catch (err) {
      console.error('Redis get error:', err);
    }
  } else {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      cachedData = cached.data;
    }
  }

  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  const lastRequest = requestTimestamps.get(cacheKey);
  if (lastRequest && Date.now() - lastRequest < 10000) {
    const cached = cache.get(cacheKey);
    if (cached) return res.status(200).json(cached.data);
    return res.status(429).json({
      status: 'error',
      message: 'rate_limited',
      friendlyMessage: "We've hit today's news limit. Please try again in a bit."
    });
  }
  requestTimestamps.set(cacheKey, Date.now());

  let urlTemplate;
  if (q && q.trim() !== '') {
    urlTemplate = `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&token=TOKEN_PLACEHOLDER&lang=en&max=10&page=${page || 1}`;
  } else {
    urlTemplate = `https://gnews.io/api/v4/top-headlines?category=${category || 'general'}&lang=en&country=${country || 'us'}&max=10&token=TOKEN_PLACEHOLDER&page=${page || 1}`;
  }

  try {
    // Try primary key first
    let { data } = await fetchFromGNews(urlTemplate, primaryKey);

    // If primary key is rate-limited/errored and we have a backup, try it
    if (data.errors && backupKey) {
      console.log('Primary GNews key failed, trying backup key...');
      const backupResult = await fetchFromGNews(urlTemplate, backupKey);
      data = backupResult.data;
    }

    if (data.errors) {
      const cached = cache.get(cacheKey);
      if (cached) return res.status(200).json(cached.data);
      return res.status(429).json({
        status: 'error',
        message: data.errors[0],
        friendlyMessage: "We've hit today's news limit. Please try again in a bit."
      });
    }

    const normalized = {
      status: 'ok',
      totalResults: data.totalArticles || 0,
      articles: (data.articles || []).map(a => ({
        title: a.title,
        description: a.description,
        url: a.url,
        urlToImage: a.image,
        publishedAt: a.publishedAt,
        author: a.source?.name || null,
        source: { name: a.source?.name || 'Unknown' }
      }))
    };

    if (isRedisConnected && redisClient) {
      try {
        await redisClient.set(cacheKey, JSON.stringify(normalized), {
          EX: 6 * 60 * 60 // 6 hours
        });
      } catch (err) {
        console.error('Redis set error:', err);
      }
    } else {
      cache.set(cacheKey, { data: normalized, time: Date.now() });
    }
    res.status(200).json(normalized);

  } catch (err) {
    const cached = cache.get(cacheKey);
    if (cached) return res.status(200).json(cached.data);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch news',
      friendlyMessage: "Something went wrong loading news. Please try again."
    });
  }
});
// ─── AI SUMMARIZE ───────────────────────────────────────────
app.post('/api/summarize', async (req, res) => {
  const { title, description } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!title && !description) {
    return res.status(400).json({ summary: 'No content to summarize.' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `Summarize this news article in exactly 3 bullet points starting with •. Be concise.

Title: ${title}
Description: ${description}`
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('Groq summarize error (full):', JSON.stringify(data.error));
      return res.status(500).json({ summary: `AI error: ${data.error.message || 'unavailable'}` });
    }

    const summary = data.choices[0].message.content;
    res.json({ summary });

  } catch (err) {
    console.error('Summarize error:', err.message);
    res.status(500).json({ summary: 'Could not generate summary.' });
  }
});

// ─── AI PERSPECTIVE ───────────────────────────────────────────
app.post('/api/perspective', async (req, res) => {
  const { title, description } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!title && !description) {
    return res.status(400).json({ perspective: 'No content to analyze.' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: `Analyze this news article and provide exactly 3 bullet points (starting with •) presenting an alternative perspective. Each bullet point must be maximum 15 words. Be concise.

Title: ${title}
Description: ${description}`
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('Groq perspective error (full):', JSON.stringify(data.error));
      return res.status(500).json({ perspective: `AI error: ${data.error.message || 'unavailable'}` });
    }

    const perspective = data.choices[0].message.content;
    res.json({ perspective });

  } catch (err) {
    console.error('Perspective error:', err.message);
    res.status(500).json({ perspective: 'Could not generate alternative perspective.' });
  }
});

// ─── ASK ARTICLE Q&A ───────────────────────────────────────────
app.post('/api/ask-article', async (req, res) => {
  const { title, description, question } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!question) {
    return res.status(400).json({ answer: 'Please provide a question.' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `You are a helpful news assistant. Answer the user's question based strictly on the context of the news article provided below. If the answer cannot be found or inferred from this context, state that clearly but politely. Keep the response concise (maximum 2-3 sentences).

Article Title: ${title}
Article Description: ${description}

User's Question: ${question}`
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('Groq ask-article error (full):', JSON.stringify(data.error));
      return res.status(500).json({ answer: `AI error: ${data.error.message || 'unavailable'}` });
    }

    const answer = data.choices[0].message.content;
    res.json({ answer });

  } catch (err) {
    console.error('Ask Article error:', err.message);
    res.status(500).json({ answer: 'Could not answer the question.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));