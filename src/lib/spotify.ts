import type { Release } from './types'

const SPOTIFY_ARTIST_ID = '5xfQSijbVetvH1QAS58n30'

export async function fetchSpotifyReleases(): Promise<Release[]> {
  try {
    const artistId = SPOTIFY_ARTIST_ID
    const promptText = `You are a Spotify API assistant. Fetch the latest albums and singles from the Spotify artist with ID ${artistId} (NEUROKLAST).

Please make a request to the Spotify Web API endpoint: https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&limit=50

You need to:
1. Get a Spotify access token using client credentials flow
2. Fetch the artist's albums
3. Return the data in this exact JSON format (root object with "releases" property containing an array):

{
  "releases": [
    {
      "id": "album_id",
      "title": "Album Title",
      "artwork": "image_url",
      "releaseDate": "YYYY-MM-DD",
      "spotifyUrl": "spotify_url"
    }
  ]
}

Important: Return ONLY the JSON object, no additional text or explanations.`

    const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
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
    return []
  }
}
