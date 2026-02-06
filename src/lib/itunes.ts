import type { Release } from './types'

const ARTIST_NAME = 'NEUROKLAST'

export async function fetchITunesReleases(): Promise<Release[]> {
  try {
    const response = await fetch(
      `/api/itunes?term=${encodeURIComponent(ARTIST_NAME)}`
    )
    
    if (!response.ok) {
      throw new Error(`Internal API error: ${response.status}`)
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
          releaseDate: track.releaseDate ? new Date(track.releaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          streamingLinks: {
            appleMusic: track.collectionViewUrl || track.trackViewUrl,
          },
        })
      }
    })

    const releases = Array.from(releasesMap.values())
    
    releases.sort((a, b) => 
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    )

    return releases
  } catch (error) {
    console.error('Failed to fetch from internal iTunes API:', error)
    return []
  }
}
