import { describe, expect, it } from 'vitest'
import {
  NEUROKLAST_SPOTIFY_ARTIST_ID,
  resolveSpotifyArtistUri,
  spotifyArtistUri,
  spotifyEmbedUrl,
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

describe('spotifyEmbedUrl', () => {
  it('maps a Spotify URI to the static embed iframe URL', () => {
    expect(spotifyEmbedUrl('spotify:artist:7BqEidErPMNiUXCRE0dV2n')).toBe(
      'https://open.spotify.com/embed/artist/7BqEidErPMNiUXCRE0dV2n?utm_source=generator&theme=0',
    )
  })

  it('honours the light theme flag', () => {
    expect(spotifyEmbedUrl('spotify:album:6TElDMiCO7UEj3G0S2B8X0', '1')).toBe(
      'https://open.spotify.com/embed/album/6TElDMiCO7UEj3G0S2B8X0?utm_source=generator&theme=1',
    )
  })

  it('rejects a non-URI string', () => {
    expect(spotifyEmbedUrl('https://open.spotify.com/artist/7BqEidErPMNiUXCRE0dV2n')).toBeNull()
  })
})
