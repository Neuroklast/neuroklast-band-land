import { createPublicClient } from '@/lib/supabaseServer'
import { resolveImageUrl } from '@/lib/r2'
import { GIG_PUBLIC_COLUMNS, type PublicGigRow } from '@/lib/gig-public-mapper'
import { mapMediaDownloadRow, type MediaDownloadDbRow, type MediaDownloadItem } from '@/lib/media-download'
import {
  mapReleaseRowToOverlayRelease,
  parseStreamingLinks,
  type ReleaseDbRow,
} from '@/lib/release-public-mapper'
import type { Release } from '@/lib/app-types'

export interface PublicReleaseCardItem {
  id: string
  title: string
  type: string
  release_date: string | null
  coverUrl: string | null
  streamingLinks: Array<{ platform: string; url: string }>
  manually_edited?: boolean
  overlayRelease: Release
}

/**
 * Canonical release projection for both homepage and the discography.
 * The live schema contains all selected columns (verified 2026-11-15).
 * A failed query is not equivalent to having zero releases.
 */
export const PUBLIC_RELEASE_COLUMNS =
  'id, title, type, release_date, description, cover_storage_path, cover_url, streaming_links, artists, tracks, custom_links, manually_edited'

export async function fetchPublicReleaseRows(
  supabase: ReturnType<typeof createPublicClient> = createPublicClient(),
): Promise<ReleaseDbRow[]> {
  const { data, error } = await supabase
    .from('releases')
    .select(PUBLIC_RELEASE_COLUMNS)
    .eq('active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('[public-release-repository] releases query failed:', error)
    throw new Error('Unable to load public releases')
  }
  return (data ?? []) as ReleaseDbRow[]
}

export function mapReleaseRowsToCardItems(rows: ReleaseDbRow[]): PublicReleaseCardItem[] {
  return rows.map((row) => {
    const coverUrl = resolveImageUrl(row.cover_storage_path, row.cover_url)
    const streamingLinks = parseStreamingLinks(row.streaming_links)
    const overlayRelease = mapReleaseRowToOverlayRelease(row, coverUrl)

    return {
      id: row.id,
      title: row.title,
      type: row.type,
      release_date: row.release_date,
      coverUrl,
      streamingLinks,
      manually_edited: !!row.manually_edited,
      overlayRelease,
    }
  })
}

export async function fetchPublicReleaseCardItems(): Promise<PublicReleaseCardItem[]> {
  const rows = await fetchPublicReleaseRows()
  return mapReleaseRowsToCardItems(rows)
}

export async function fetchPublicGigs(): Promise<PublicGigRow[]> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('gigs')
    .select(GIG_PUBLIC_COLUMNS)
    .eq('active', true)
    .order('event_date', { ascending: true })

  if (error) {
    console.error('[fetchPublicGigs] gigs query failed:', error.message)
    return []
  }

  return (data ?? []) as PublicGigRow[]
}

export async function fetchPublicMediaDownloads(): Promise<MediaDownloadItem[]> {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('media_downloads')
      .select(
        'id, title, description, category, file_storage_path, file_url, file_mime, file_size_bytes, original_filename, display_order',
      )
      .eq('active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('[fetchPublicMediaDownloads] query failed:', error.message)
      return []
    }

    return ((data ?? []) as MediaDownloadDbRow[]).map(mapMediaDownloadRow)
  } catch {
    return []
  }
}

export async function fetchPublicArtistName(): Promise<string> {
  try {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', 'hero')
      .maybeSingle()

    const headline = data?.value && typeof data.value === 'object'
      ? (data.value as Record<string, unknown>).headline
      : null

    return typeof headline === 'string' && headline.trim() ? headline.trim() : 'NEUROKLAST'
  } catch {
    return 'NEUROKLAST'
  }
}