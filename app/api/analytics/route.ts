import { NextResponse } from 'next/server'
import { analyticsPostSchema } from '@/api/_schemas'
import { createPublicClient } from '@/lib/supabaseServer'
import { db } from '@/lib/neurokore/server'
import { ANALYTICS_CONSENT_COOKIE, analyticsConsentSecret, verifyAnalyticsConsent } from '@/lib/analytics-consent-token'
import { consumeRateLimitForRequest } from '@/lib/rate-limit'
import { isAnalyticsTrackingAllowed, parseAnalyticsConfig } from '@/lib/analytics-config'

export const dynamic = 'force-dynamic'

// One config read per cold-start plus a short in-process cache — the POST
// handler must not re-read site_config on every analytics event.
let analyticsConfigCache: { value: unknown; fetchedAt: number } | null = null
const ANALYTICS_CONFIG_TTL_MS = 5 * 60 * 1000

async function loadAnalyticsConfig(): Promise<unknown> {
  const now = Date.now()
  if (analyticsConfigCache && now - analyticsConfigCache.fetchedAt < ANALYTICS_CONFIG_TTL_MS) {
    return analyticsConfigCache.value
  }
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('site_config')
    .select('value')
    .eq('key', 'analytics')
    .maybeSingle()
  analyticsConfigCache = { value: data?.value ?? null, fetchedAt: now }
  return analyticsConfigCache.value
}

export async function POST(request: Request) {
  // No direct anonymous database writes. Require a first-party, signed opt-in.
  const requestOrigin = new URL(request.url).origin
  const sourceOrigin = request.headers.get('origin')
  const fetchSite = request.headers.get('sec-fetch-site')
  if ((sourceOrigin && sourceOrigin !== requestOrigin) || (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none')) {
    return new NextResponse(null, { status: 204 })
  }
  const cookie = request.headers.get('cookie')?.split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(ANALYTICS_CONSENT_COOKIE + '='))
    ?.slice(ANALYTICS_CONSENT_COOKIE.length + 1)
  if (!verifyAnalyticsConsent(cookie, analyticsConsentSecret())) {
    return new NextResponse(null, { status: 204 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = analyticsPostSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  }

  // Throttle anonymous event submissions (fail-closed).
  try {
    const rl = await consumeRateLimitForRequest(request, {
      namespace: 'analytics',
      limit: 30,
      windowSeconds: 60,
    })
    if (!rl.allowed) {
      return new NextResponse(null, { status: 429 })
    }
  } catch (err) {
    console.warn('[analytics] rate limit unavailable, rejecting (fail-closed):', err)
    return new NextResponse(null, { status: 429 })
  }

  try {
    const config = parseAnalyticsConfig(await loadAnalyticsConfig())
    if (!isAnalyticsTrackingAllowed(config, parsed.data.type)) {
      return new NextResponse(null, { status: 204 })
    }

    // Do not collect data unless the automated 90-day cleanup is configured.
    if (!process.env.CRON_SECRET) return new NextResponse(null, { status: 204 })

    // Dedicated server-side insert after signed consent and IP rate limiting.
    const supabase = db()
    const { error } = await supabase.from('analytics_events').insert({
      type: parsed.data.type,
      target: parsed.data.target ?? null,
      meta: parsed.data.meta ?? null,
      heatmap: parsed.data.heatmap ?? null,
    })

    if (error) {
      console.warn('[analytics] insert failed:', error.message)
    }
  } catch (e) {
    console.warn('[analytics] handler error:', e instanceof Error ? e.message : e)
  }

  return new NextResponse(null, { status: 204 })
}