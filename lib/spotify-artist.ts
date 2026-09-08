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
