import { NextResponse } from 'next/server'
import { isAdminSession } from '@/lib/api-admin-auth'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { parseCatalogueSyncConfig } from '@/lib/catalogue-sync-config'
import {
  buildReleaseEnrichmentUpdate,
  releaseNeedsEnrichment,
  type ReleaseEnrichmentRow,
} from '@/lib/release-enrichment'

export const dynamic = 'force-dynamic'

const ENRICHMENT_SELECT =
  'id, title, tracks, manually_edited, spotify_id, discogs_id, itunes_id, tracks_source, last_enriched_at, streaming_links'

const CRON_BATCH_LIMIT = 15

export async function POST(_request: Request) {
  const admin = await isAdminSession()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const { data: configRow } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', 'catalogue_sync')
      .maybeSingle()

    const artistName = parseCatalogueSyncConfig(configRow?.value).artistName || 'Neuroklast'

    const { data: rows, error: listError } = await supabase
      .from('releases')
      .select(ENRICHMENT_SELECT)
      .eq('manually_edited', false)
      .order('display_order', { ascending: true })

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 })
    }

    const candidates = (rows ?? []).filter((row: ReleaseEnrichmentRow) =>
      releaseNeedsEnrichment(row),
    )
    const batch = candidates.slice(0, CRON_BATCH_LIMIT)

    let enriched = 0
    let skipped = 0
    const errors: string[] = []

    for (const row of batch) {
      const release = row as ReleaseEnrichmentRow
      const update = await buildReleaseEnrichmentUpdate(release, artistName)
      if (!update) {
        skipped++
        continue
      }

      const { error: updateError } = await supabase.from('releases').update(update).eq('id', release.id)
      if (updateError) {
        skipped++
        errors.push(`"${release.title}": ${updateError.message}`)
        continue
      }

      enriched++
    }

    return NextResponse.json(
      {
        success: true,
        enriched,
        skipped,
        remaining: Math.max(0, candidates.length - batch.length),
        errors,
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    console.error('[releases-track-enrich] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to enrich release tracklists' }, { status: 500 })
  }
}