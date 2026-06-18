export default async function handler(req, res) {
  const { country, category, q, page, pageSize } = req.query;
  const apiKey = process.env.NEWS_API_KEY;

  let url;
  if (q && q.trim() !== '') {
    url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&apiKey=${apiKey}&page=${page || 1}&pageSize=${pageSize || 8}`;
  } else {
    url = `https://newsapi.org/v2/top-headlines?country=${country || 'us'}&category=${category || 'general'}&apiKey=${apiKey}&page=${page || 1}&pageSize=${pageSize || 8}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch news from upstream API' });
  }
}