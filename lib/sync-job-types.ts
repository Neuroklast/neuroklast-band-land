/**
 * Public contract for the supported background catalogue synchronization jobs.
 * Keep this list shared by creation and read-only polling endpoints.
 */
export const SYNC_JOB_TYPES = [
  'discogs_sync',
  'spotify_sync',
  'itunes_sync',
  'track_enrichment',
  'bandsintown_sync',
  'purge_and_sync_releases',
  'purge_and_sync_gigs',
] as const

export type SyncJobType = (typeof SYNC_JOB_TYPES)[number]

const allowedTypes: ReadonlySet<string> = new Set(SYNC_JOB_TYPES)

export type ActiveSyncJobTypesQuery =
  | { valid: true; types: SyncJobType[] | undefined }
  | { valid: false }

/**
 * Mirrors the previous /api/sync-jobs/active query behavior:
 * - absent or empty "types" means no filter;
 * - comma-separated entries are trimmed and empty entries ignored;
 * - duplicates retain their order;
 * - any unsupported value rejects the entire request.
 */
export function parseActiveSyncJobTypes(value: string | null): ActiveSyncJobTypesQuery {
  if (!value) return { valid: true, types: undefined }

  const requested = value.split(',').map(item => item.trim()).filter(Boolean)
  if (requested.some(item => !allowedTypes.has(item))) {
    return { valid: false }
  }

  return { valid: true, types: requested as SyncJobType[] }
}

/** Initial states for a new sync job, independent from the HTTP adapter. */
export function initialSyncJobPhase(type: SyncJobType): 'purge' | 'fetch' | 'enrich' {
  if (type === 'purge_and_sync_releases' || type === 'purge_and_sync_gigs') return 'purge'
  if (type === 'track_enrichment') return 'enrich'
  return 'fetch'
}

export function initialSyncJobPayload(type: SyncJobType): Record<string, unknown> {
  if (type === 'discogs_sync') return { source: 'discogs', stagedItems: [], importCursor: 0 }
  if (type === 'spotify_sync') return { source: 'spotify', stagedItems: [], importCursor: 0 }
  if (type === 'itunes_sync') return { source: 'itunes', stagedItems: [], importCursor: 0 }
  if (type === 'track_enrichment') return { enrichCursor: 0 }
  if (type === 'bandsintown_sync') return { gigImportCursor: 0 }
  return {}
}
