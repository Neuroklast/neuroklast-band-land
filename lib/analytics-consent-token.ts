import { createHmac, timingSafeEqual } from 'node:crypto'

/** A signed, HttpOnly record of an explicit analytics opt-in, not a user identifier. */
export const ANALYTICS_CONSENT_COOKIE = 'nk_analytics_consent'
export const ANALYTICS_CONSENT_VERSION = 3
export const ANALYTICS_CONSENT_MAX_AGE_SECONDS = 180 * 24 * 60 * 60

function signature(payload: string, secret: string): string {
  return createHmac('sha256', secret)
    .update('neuroklast.analytics-consent:' + payload)
    .digest('hex')
}

export function signAnalyticsConsent(secret: string, now = Date.now()): string {
  if (!secret) throw new Error('Analytics consent signature unavailable')
  const payload = `${ANALYTICS_CONSENT_VERSION}.${Math.floor(now / 1000)}`
  return payload + '.' + signature(payload, secret)
}

export function verifyAnalyticsConsent(token: string | undefined, secret: string | undefined, now = Date.now()): boolean {
  if (!token || !secret) return false
  const match = /^(\\d+)\\.(\\d+)\\.([a-f0-9]{64})$/.exec(token)
  if (!match || Number(match[1]) !== ANALYTICS_CONSENT_VERSION) return false
  const issued = Number(match[2])
  const age = Math.floor(now / 1000) - issued
  if (!Number.isSafeInteger(issued) || age < 0 || age > ANALYTICS_CONSENT_MAX_AGE_SECONDS) return false
  const actual = Buffer.from(match[3], 'hex')
  const expected = Buffer.from(signature(match[1] + '.' + match[2], secret), 'hex')
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

/** Rotate ANALYTICS_CONSENT_SECRET independently when available. */
export function analyticsConsentSecret(): string | undefined {
  return process.env.ANALYTICS_CONSENT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
}
