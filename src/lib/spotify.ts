import type { Release, Gig } from './types'

const SPOTIFY_ARTIST_ID = '5xfQSijbVetvH1QAS58n30'
const ARTIST_NAME = 'NEUROKLAST'

export async function fetchSpotifyReleases(): Promise<Release[]> {
  try {
    if (typeof window.spark === 'undefined') return []
    const artistId = SPOTIFY_ARTIST_ID
    
    const promptText = `You are a Spotify data fetcher. Get the latest albums and singles from Spotify artist ID ${artistId} (NEUROKLAST).

Fetch from Spotify Web API: https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&limit=50

Steps:
1. Get Spotify access token (client credentials flow)
2. Fetch artist albums/singles
3. For each album/single, extract: id, name, release_date, external_urls.spotify, and images (use largest image)

Return data as JSON with this structure:
{
  "releases": [
    {
      "id": "spotify_album_id",
      "title": "Track/Album Name",
      "artwork": "https://i.scdn.co/image/...",
      "releaseDate": "YYYY-MM-DD",
      "spotifyUrl": "https://open.spotify.com/..."
    }
  ]
}

Return ONLY valid JSON, no explanations.`

    const response = await window.spark.llm(promptText, 'gpt-4o', true)
    
    let data
    try {
      data = JSON.parse(response)
    } catch (parseError) {
      console.error('Failed to parse Spotify API response:', parseError)
      return []
    }
    
    if (!data || typeof data !== 'object') {
      console.warn('Invalid data format from Spotify API')
      return []
    }

    if (!data.releases || !Array.isArray(data.releases)) {
      console.warn('No releases array in response')
      return []
    }

    const releases: Release[] = data.releases
      .filter((item: any) => item && item.id && item.title)
      .map((item: any) => ({
        id: item.id,
        title: item.title,
        artwork: item.artwork || '',
        releaseDate: item.releaseDate || new Date().toISOString().split('T')[0],
        streamingLinks: {
          spotify: item.spotifyUrl || '',
        },
      }))

    return releases
  } catch (error) {
    console.error('Error fetching Spotify releases:', error)
    return []
  }
}

export async function fetchUpcomingGigs(): Promise<Gig[]> {
  try {
    if (typeof window.spark === 'undefined') return []
    const artistName = ARTIST_NAME
    
    const promptText = `You are a concert data fetcher. Find upcoming concerts and tour dates for the artist "${artistName}".

Search for upcoming concerts using these sources:
1. Songkick API (https://www.songkick.com/developer) - search for artist and get upcoming events
2. Bandsintown API - search for artist events
3. Any other available concert/event APIs

For the artist "${artistName}", find all upcoming concerts (future dates only).

Return data as JSON with this structure:
{
  "gigs": [
    {
      "id": "unique_id",
      "date": "YYYY-MM-DDTHH:mm:ss",
      "venue": "Venue Name",
      "location": "City, Country",
      "ticketUrl": "https://ticket-url.com"
    }
  ]
}

IMPORTANT: 
- Only include future dates (after today)
- date must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ss)
- If no concerts found, return empty array: {"gigs": []}
- Return ONLY valid JSON, no explanations.`

    const response = await window.spark.llm(promptText, 'gpt-4o', true)
    
    let data
    try {
      data = JSON.parse(response)
    } catch (parseError) {
      console.error('Failed to parse concert API response:', parseError)
      return []
    }
    
    if (!data || typeof data !== 'object') {
      console.warn('Invalid data format from concert APIs')
      return []
    }

    if (!data.gigs || !Array.isArray(data.gigs)) {
      console.warn('No gigs array in response')
      return []
    }

    const gigs: Gig[] = data.gigs
      .filter((item: any) => item && item.venue && item.location && item.date)
      .map((item: any) => ({
        id: item.id || `gig-${Date.now()}-${Math.random()}`,
        date: item.date,
        venue: item.venue,
        location: item.location,
        ticketUrl: item.ticketUrl || undefined,
      }))

    return gigs
  } catch (error) {
    console.error('Error fetching upcoming gigs:', error)
    return []
  }
}
