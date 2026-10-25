import { normalizeSpotifyArtistId } from '@/lib/release-external-ids'

/** Neuroklast on Spotify (MusicBrainz url-rel). */
export const NEUROKLAST_SPOTIFY_ARTIST_ID = '5xfQSijbVetvH1QAS58n30'

export function spotifyArtistUri(id: string): string {
  return `spotify:artist:${id}`
}

export function resolveSpotifyArtistUri(
  candidates: Array<string | null | undefined>,
  fallbackId = NEUROKLAST_SPOTIFY_ARTIST_ID,
): string {
  for (const candidate of candidates) {
    if (!candidate) continue
    const id = normalizeSpotifyArtistId(candidate)
    if (id) return spotifyArtistUri(id)
  }
  return spotifyArtistUri(fallbackId)
}

const SPOTIFY_EMBED_URI =
  /^spotify:(artist|album|track|playlist|episode|show):([A-Za-z0-9]+)$/i

/** Static embed URL. Do not use the Spotify iframe-api script — it eval()s and fails production CSP. */
export function spotifyEmbedUrl(uri: string, theme: '0' | '1' = '0'): string | null {
  const match = SPOTIFY_EMBED_URI.exec(uri.trim())
  if (!match) return null
  const type = match[1]
  const id = match[2]
  if (!type || !id) return null
  return `https://open.spotify.com/embed/${type.toLowerCase()}/${id}?utm_source=generator&theme=${theme}`
}
