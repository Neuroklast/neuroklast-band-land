export async function getBandsintownGigs(artistName, appId = 'neuroklast-cms') {
  try {
    const response = await fetch(`https://rest.bandsintown.com/artists/${encodeURIComponent(artistName)}/events?app_id=${appId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching from Bandsintown:', error);
    return [];
  }
}
