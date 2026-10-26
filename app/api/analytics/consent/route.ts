import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  ANALYTICS_CONSENT_COOKIE,
  ANALYTICS_CONSENT_MAX_AGE_SECONDS,
  ANALYTICS_CONSENT_VERSION,
  analyticsConsentSecret,
  signAnalyticsConsent,
} from '@/lib/analytics-consent-token'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const consentBody = z.object({
  analytics: z.boolean(),
  version: z.literal(ANALYTICS_CONSENT_VERSION),
}).strict()

export async function POST(request: Request) {
  // A same-origin user action is required to update this cookie.
  if (request.headers.get('origin') !== new URL(request.url).origin) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  }
  const size = Number(request.headers.get('content-length') ?? '0')
  if (!Number.isFinite(size) || size > 512) return new NextResponse(null, { status: 413 })
  const parsed = consentBody.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid consent' }, { status: 400 })

  const response = new NextResponse(null, {
    status: 204,
    headers: { 'Cache-Control': 'no-store' },
  })
  const cookie = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  }
  if (parsed.data.analytics) {
    const secret = analyticsConsentSecret()
    if (!secret) return NextResponse.json({ error: 'Consent service unavailable' }, { status: 503 })
    response.cookies.set(ANALYTICS_CONSENT_COOKIE, signAnalyticsConsent(secret), {
      ...cookie, maxAge: ANALYTICS_CONSENT_MAX_AGE_SECONDS,
    })
  } else {
    response.cookies.set(ANALYTICS_CONSENT_COOKIE, '', { ...cookie, maxAge: 0 })
  }
  return response
}
