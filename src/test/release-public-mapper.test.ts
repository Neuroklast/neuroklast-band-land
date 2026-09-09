import { describe, expect, it } from 'vitest'
import { mapReleaseRowToOverlayRelease, parseReleaseTracks } from '@/lib/release-public-mapper'

describe('parseReleaseTracks', () => {
  it('parses track rows with artist and duration', () => {
    const tracks = parseReleaseTracks([
      { title: 'Kernel Breaker', artist: 'Neuroklast & Guest', duration: '4:12' },
      { title: 'Intro', artist: 'Neuroklast' },
    ])
    expect(tracks).toHaveLength(2)
    expect(tracks[0].artist).toBe('Neuroklast & Guest')
    expect(tracks[0].duration).toBe('4:12')
  })
})

describe('mapReleaseRowToOverlayRelease', () => {
  it('maps tracks and artists into overlay release data', () => {
    const overlay = mapReleaseRowToOverlayRelease(
      {
        id: 'r1',
        title: 'Antihero',
        type: 'album',
        release_date: '2023-03-15',
        description: 'Album notes',
        cover_storage_path: null,
        cover_url: 'https://example.com/cover.jpg',
        streaming_links: [{ platform: 'spotify', url: 'https://open.spotify.com/album/x' }],
        artists: ['Neuroklast', 'Guest'],
        tracks: [
          { title: 'Track 1', artist: 'Neuroklast', duration: '3:00' },
          { title: 'Track 2', artist: 'Neuroklast & Guest', duration: '4:00' },
        ],
        custom_links: [{ label: 'Buy', url: 'https://example.com/buy' }],
        manually_edited: true,
      },
      'https://example.com/cover.jpg',
    )

    expect(overlay.tracks).toHaveLength(2)
    expect(overlay.artists).toEqual(['Neuroklast', 'Guest'])
    expect(overlay.customLinks?.[0].label).toBe('Buy')
    expect(overlay.streamingLinks?.[0].platform).toBe('spotify')
  })
})