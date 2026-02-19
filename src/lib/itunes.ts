import type { Release } from './types'
import { fetchWithRetry } from './fetch-retry'

const ARTIST_NAME = 'NEUROKLAST'

export async function fetchITunesReleases(): Promise<Release[]> {
  try {
    // Fetch both songs and albums to capture every release (singles, EPs, albums)
    const response = await fetchWithRetry(
      `/api/itunes?term=${encodeURIComponent(ARTIST_NAME)}&entity=all`
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Internal iTunes API call failed:', response.status, errorText)
      throw new Error(`Internal iTunes API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.results || !Array.isArray(data.results)) {
      console.warn('No results from iTunes API')
      return []
    }

    const releasesMap = new Map<string, Release>()
    
    data.results.forEach((track: any) => {
      if (!track.collectionId || !track.collectionName) return
      
      const collectionId = track.collectionId.toString()
      
      if (!releasesMap.has(collectionId)) {
        releasesMap.set(collectionId, {
          id: `itunes-${collectionId}`,
          title: track.collectionName,
          artwork: track.artworkUrl100?.replace('100x100bb', '600x600bb') || track.artworkUrl60?.replace('60x60bb', '600x600bb'),
          releaseDate: track.releaseDate ? new Date(track.releaseDate).toISOString().split('T')[0] : undefined,
          streamingLinks: {
            appleMusic: track.collectionViewUrl || track.trackViewUrl,
          },
        })
      }
    })

    const releases = Array.from(releasesMap.values())
    
    // Sort chronologically (oldest first), releases without dates go to the end
    releases.sort((a, b) => {
      if (!a.releaseDate && !b.releaseDate) return 0
      if (!a.releaseDate) return 1
      if (!b.releaseDate) return -1
      return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
    })

    return releases
  } catch (error) {
    console.error('Error fetching iTunes releases from internal API:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    return []
  }
}