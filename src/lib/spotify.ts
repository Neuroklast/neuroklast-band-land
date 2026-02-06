import type { Release } from './types'

const SPOTIFY_ARTIST_ID = '5xfQSijbVetvH1QAS58n30'

export async function fetchSpotifyReleases(): Promise<Release[]> {
  try {
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
    const data = JSON.parse(response)
    
    if (!data.releases || !Array.isArray(data.releases)) {
      throw new Error('Invalid response format')
    }

    const releases: Release[] = data.releases.map((item: any) => ({
      id: item.id,
      title: item.title,
      artwork: item.artwork,
      releaseDate: item.releaseDate,
      streamingLinks: {
        spotify: item.spotifyUrl,
      },
    }))

    return releases
  } catch (error) {
    console.error('Error fetching Spotify releases:', error)
    throw error
  }
}
