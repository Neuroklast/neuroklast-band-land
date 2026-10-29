import { describe, expect, it } from 'vitest'
import {
  SYNC_JOB_TYPES,
  initialSyncJobPayload,
  initialSyncJobPhase,
  parseActiveSyncJobTypes,
} from '@/lib/sync-job-types'

describe('sync job type contract', () => {
  it('keeps the seven supported API types in their original order', () => {
    expect(SYNC_JOB_TYPES).toEqual([
      'discogs_sync', 'spotify_sync', 'itunes_sync', 'track_enrichment',
      'bandsintown_sync', 'purge_and_sync_releases', 'purge_and_sync_gigs',
    ])
  })

  it('does not filter when the types parameter is absent or blank', () => {
    expect(parseActiveSyncJobTypes(null)).toEqual({ valid: true, types: undefined })
    expect(parseActiveSyncJobTypes('')).toEqual({ valid: true, types: undefined })
  })

  it('preserves old trimming, empty entry and duplicate handling', () => {
    expect(parseActiveSyncJobTypes(' ,  ')).toEqual({ valid: true, types: [] })
    expect(parseActiveSyncJobTypes('spotify_sync, ,itunes_sync,spotify_sync')).toEqual({
      valid: true,
      types: ['spotify_sync', 'itunes_sync', 'spotify_sync'],
    })
  })

  it('rejects the whole query if one type is unsupported', () => {
    expect(parseActiveSyncJobTypes('spotify_sync,other')).toEqual({ valid: false })
    expect(parseActiveSyncJobTypes('SPOTIFY_SYNC')).toEqual({ valid: false })
    expect(parseActiveSyncJobTypes('unknown')).toEqual({ valid: false })
  })

  it('preserves initial phase and payload per job type', () => {
    expect(initialSyncJobPhase('purge_and_sync_releases')).toBe('purge')
    expect(initialSyncJobPhase('purge_and_sync_gigs')).toBe('purge')
    expect(initialSyncJobPhase('track_enrichment')).toBe('enrich')
    expect(initialSyncJobPhase('itunes_sync')).toBe('fetch')
    expect(initialSyncJobPayload('itunes_sync')).toEqual({
      source: 'itunes', stagedItems: [], importCursor: 0,
    })
    expect(initialSyncJobPayload('discogs_sync')).toEqual({
      source: 'discogs', stagedItems: [], importCursor: 0,
    })
    expect(initialSyncJobPayload('spotify_sync')).toEqual({
      source: 'spotify', stagedItems: [], importCursor: 0,
    })
    expect(initialSyncJobPayload('bandsintown_sync')).toEqual({ gigImportCursor: 0 })
    expect(initialSyncJobPayload('track_enrichment')).toEqual({ enrichCursor: 0 })
    expect(initialSyncJobPayload('purge_and_sync_gigs')).toEqual({})
  })

  it('returns a fresh payload for every call', () => {
    const first = initialSyncJobPayload('spotify_sync')
    const second = initialSyncJobPayload('spotify_sync')
    expect(second).toEqual(first)
    expect(second).not.toBe(first)
    expect(second.stagedItems).not.toBe(first.stagedItems)
  })
})
