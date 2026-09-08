import { describe, expect, it } from 'vitest'
import {
  NEUROKLAST_SPOTIFY_ARTIST_ID,
  resolveSpotifyArtistUri,
  spotifyArtistUri,
} from '@/lib/spotify-artist'

describe('resolveSpotifyArtistUri', () => {
  it('uses Neuroklast artist as default', () => {
    expect(resolveSpotifyArtistUri([])).toBe(spotifyArtistUri(NEUROKLAST_SPOTIFY_ARTIST_ID))
  })

  it('parses an open.spotify.com artist URL', () => {
    expect(
      resolveSpotifyArtistUri(['https://open.spotify.com/artist/5xfQSijbVetvH1QAS58n30?si=abc']),
    ).toBe('spotify:artist:5xfQSijbVetvH1QAS58n30')
  })
})
