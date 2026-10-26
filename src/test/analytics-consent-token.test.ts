import { describe, expect, it } from 'vitest'
import {
  ANALYTICS_CONSENT_MAX_AGE_SECONDS,
  signAnalyticsConsent,
  verifyAnalyticsConsent,
} from '@/lib/analytics-consent-token'

describe('signed analytics opt-in', () => {
  const secret = 'unit-test-secret-do-not-use-in-production'
  const now = Date.UTC(2026, 9, 26)

  it('validates only the unmodified signed token', () => {
    const token = signAnalyticsConsent(secret, now)
    expect(verifyAnalyticsConsent(token, secret, now)).toBe(true)
    expect(verifyAnalyticsConsent(token, 'another-secret', now)).toBe(false)
    const [version, issued, mac] = token.split('.')
    const modified = version + '.' + issued + '.' + (mac[0] === 'a' ? 'b' : 'a') + mac.slice(1)
    expect(verifyAnalyticsConsent(modified, secret, now)).toBe(false)
    expect(verifyAnalyticsConsent(undefined, secret, now)).toBe(false)
  })

  it('expires and rejects future-dated consent', () => {
    const token = signAnalyticsConsent(secret, now)
    expect(verifyAnalyticsConsent(token, secret, now + (ANALYTICS_CONSENT_MAX_AGE_SECONDS + 1) * 1000)).toBe(false)
    expect(verifyAnalyticsConsent(token, secret, now - 1000)).toBe(false)
  })
})
