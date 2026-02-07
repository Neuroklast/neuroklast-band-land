export default async function handler(req, res) {
  const { term, entity } = req.query;

  if (!term) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  try {
    // When entity is "all", fetch both songs and albums to capture every release
    if (entity === 'all') {
      const [songsRes, albumsRes] = await Promise.all([
        fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=200`),
        fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=album&limit=200`),
      ]);

      if (!songsRes.ok) throw new Error(`iTunes songs API responded with ${songsRes.status}`);
      if (!albumsRes.ok) throw new Error(`iTunes albums API responded with ${albumsRes.status}`);

      const [songsData, albumsData] = await Promise.all([songsRes.json(), albumsRes.json()]);

      const combined = {
        resultCount: (songsData.resultCount || 0) + (albumsData.resultCount || 0),
        results: [...(songsData.results || []), ...(albumsData.results || [])],
      };
      return res.status(200).json(combined);
    }

    // Default: single entity search (backwards compatible)
    const searchEntity = entity || 'album';
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=${encodeURIComponent(searchEntity)}&limit=200`);
    
    if (!response.ok) {
      throw new Error(`iTunes API responded with ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('iTunes API error:', error);
    return res.status(500).json({ error: 'Failed to fetch from iTunes API' });
  }
}

