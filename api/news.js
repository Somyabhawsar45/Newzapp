const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  const { country, category, q, page } = req.query;
  const apiKey = process.env.GNEWS_API_KEY;

  // Cache check
  const cacheKey = JSON.stringify(req.query);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return res.status(200).json(cached.data);
  }

  let url;
  if (q && q.trim() !== '') {
    url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&token=${apiKey}&lang=en&max=10&page=${page || 1}`;
  } else {
    url = `https://gnews.io/api/v4/top-headlines?category=${category || 'general'}&lang=en&country=${country || 'us'}&max=10&token=${apiKey}&page=${page || 1}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Normalize GNews response to match NewsAPI format
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

    // Save to cache
    cache.set(cacheKey, { data: normalized, time: Date.now() });

    res.status(200).json(normalized);
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch news' });
  }
}