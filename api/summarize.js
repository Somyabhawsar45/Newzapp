export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { title, description } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

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
          content: `Summarize this news article in exactly 3 bullet points starting with •. Be concise.\n\nTitle: ${title}\nDescription: ${description}`
        }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ summary: 'AI service unavailable.' });

    res.json({ summary: data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ summary: 'Could not generate summary.' });
  }
}