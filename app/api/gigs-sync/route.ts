import { NextResponse } from 'next/server'
import { isAdminSession } from '@/lib/api-admin-auth'
import { getApiSecret } from '@/lib/api-secrets'
import { createAdminClient } from '@/lib/supabaseAdmin'
import {
  resolveBandsintownArtistName,
  syncBandsintownGigsToSupabase,
} from '@/lib/bandsintown-sync'

export const dynamic = 'force-dynamic'

export async function POST(_request: Request) {
  const admin = await isAdminSession()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = await getApiSecret('bandsintown_api_key')
  if (!apiKey) {
    return NextResponse.json({ error: 'Bandsintown API key not configured' }, { status: 503 })
  }

  try {
    const supabase = createAdminClient()
    const artistName = await resolveBandsintownArtistName(supabase)
    const result = await syncBandsintownGigsToSupabase(supabase, artistName, apiKey)

    return NextResponse.json({ success: true, ...result }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[gigs-sync] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to sync gigs' }, { status: 500 })
  }
}