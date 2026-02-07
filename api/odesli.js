export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'A streaming URL is required' });
  }

  try {
    const response = await fetch(
      `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(url)}&userCountry=DE`
    );

    if (!response.ok) {
      throw new Error(`Odesli API responded with ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Odesli API error:', error);
    return res.status(500).json({ error: 'Failed to fetch from Odesli API' });
  }
}
