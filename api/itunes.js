export default async function handler(req, res) {
  // Deine Suchparameter holen (z.B. ?term=Neuroklast)
  const { term } = req.query; 
  
  if (!term) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  try {
    // Serverseitig abrufen (hier gibt es kein CORS!)
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=50`);
    
    if (!response.ok) {
      throw new Error(`iTunes API responded with ${response.status}`);
    }

    const data = await response.json();
    
    // Daten an dein Frontend zurückgeben, mit erlaubtem CORS Header
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
