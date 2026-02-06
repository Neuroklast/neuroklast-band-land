export default async function handler(req, res) {
  
  

    return res.status(400).json({ error: 'Search term is required' });
  }

  try {
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=50`);
    
    if (!response.ok) {
      throw new Error(`iTunes API responded with ${response.status}`);
    }

    const data = await response.json();
    
  }





