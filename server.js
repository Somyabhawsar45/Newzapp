const express = require('express');
const cors = require('cors');
require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json()); // needed for POST body parsing

const cache = new Map();
const CACHE_TTL = 15 * 60 * 1000;
const requestTimestamps = new Map();

// ─── NEWS API ───────────────────────────────────────────────
app.get('/api/news', async (req, res) => {
  const { country, category, q, page } = req.query;
  const apiKey = process.env.GNEWS_API_KEY;

  const cacheKey = JSON.stringify(req.query);

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return res.status(200).json(cached.data);
  }

  const lastRequest = requestTimestamps.get(cacheKey);
  if (lastRequest && Date.now() - lastRequest < 10000) {
    if (cached) return res.status(200).json(cached.data);
    return res.status(429).json({ status: 'error', message: 'Too many requests, please wait.' });
  }
  requestTimestamps.set(cacheKey, Date.now());

  let url;
  if (q && q.trim() !== '') {
    url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&token=${apiKey}&lang=en&max=10&page=${page || 1}`;
  } else {
    url = `https://gnews.io/api/v4/top-headlines?category=${category || 'general'}&lang=en&country=${country || 'us'}&max=10&token=${apiKey}&page=${page || 1}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.errors) {
      if (cached) return res.status(200).json(cached.data);
      return res.status(429).json({ status: 'error', message: data.errors[0] });
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

    cache.set(cacheKey, { data: normalized, time: Date.now() });
    res.status(200).json(normalized);

  } catch (err) {
    if (cached) return res.status(200).json(cached.data);
    res.status(500).json({ status: 'error', message: 'Failed to fetch news' });
  }
});
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
model: "llama-3.1-8b-instant",
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
      console.error('Groq error:', data.error);
      return res.status(500).json({ summary: 'AI service unavailable.' });
    }

    const summary = data.choices[0].message.content;
    res.json({ summary });

  } catch (err) {
    console.error('Summarize error:', err);
    res.status(500).json({ summary: 'Could not generate summary.' });
  }
});

app.listen(5000, () => console.log('Backend running on port 5000'));