import type { Release, Gig } from './types'

/**
 * Gigs and releases are managed through the admin edit mode (stored in Vercel KV).
 * These stubs exist for backwards compatibility with components that call them.
 * The ReleasesSection uses fetchITunesReleases from itunes.ts for auto-fetching.
 */

export async function fetchSpotifyReleases(): Promise<Release[]> {
  return []
}

export async function fetchUpcomingGigs(): Promise<Gig[]> {
  return []
}
