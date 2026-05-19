/**
 * Tests for activation key validation logic (src/lib/activation.ts)
 * and license tier utilities (src/lib/license.ts).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { tierAtLeast, hasFeature, TIER_LABELS, TIER_ORDER } from '@/lib/license'

// ─── License tier utilities ───────────────────────────────────────────────────

describe('tierAtLeast', () => {
  it('free meets free', () => expect(tierAtLeast('free', 'free')).toBe(true))
  it('free does not meet premium', () => expect(tierAtLeast('free', 'premium')).toBe(false))
  it('premium meets free', () => expect(tierAtLeast('premium', 'free')).toBe(true))
  it('premium meets premium', () => expect(tierAtLeast('premium', 'premium')).toBe(true))
  it('premium does not meet agency', () => expect(tierAtLeast('premium', 'agency')).toBe(false))
  it('agency meets premium', () => expect(tierAtLeast('agency', 'premium')).toBe(true))
  it('agency meets agency', () => expect(tierAtLeast('agency', 'agency')).toBe(true))
})

describe('hasFeature', () => {
  it('free has no premium features', () => {
    expect(hasFeature('free', 'premium-themes')).toBe(false)
    expect(hasFeature('free', 'premium-widgets')).toBe(false)
    expect(hasFeature('free', 'analytics')).toBe(false)
  })

  it('premium has premium-themes, premium-widgets, analytics', () => {
    expect(hasFeature('premium', 'premium-themes')).toBe(true)
    expect(hasFeature('premium', 'premium-widgets')).toBe(true)
    expect(hasFeature('premium', 'analytics')).toBe(true)
  })

  it('premium does not have multi-site', () => {
    expect(hasFeature('premium', 'multi-site')).toBe(false)
  })

  it('agency has multi-site', () => {
    expect(hasFeature('agency', 'multi-site')).toBe(true)
  })
})

describe('TIER_LABELS', () => {
  it('all tiers have labels', () => {
    for (const tier of TIER_ORDER) {
      expect(TIER_LABELS[tier]).toBeTruthy()
    }
  })
})

// ─── Activation key validation ───────────────────────────────────────────────

describe('validateActivationKey', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear()
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    sessionStorage.clear()
  })

  it('returns valid free-tier result when VITE_ACTIVATION_KEY is not set', async () => {
    vi.stubEnv('VITE_ACTIVATION_KEY', '')
    const { validateActivationKey } = await import('@/lib/activation')
    const result = await validateActivationKey()
    expect(result.valid).toBe(true)
    expect(result.tier).toBe('free')
  })

  it('bypasses validation when hostname is neuroklast.net', async () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'neuroklast.net' },
      writable: true,
      configurable: true,
    })
    vi.stubEnv('VITE_ACTIVATION_KEY', '')
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { validateActivationKey } = await import('@/lib/activation')
    const result = await validateActivationKey()
    expect(result.valid).toBe(true)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('returns valid (free) when no key configured and hostname is not primary', async () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'other-tenant.vercel.app' },
      writable: true,
      configurable: true,
    })
    vi.stubEnv('VITE_ACTIVATION_KEY', '')
    const { validateActivationKey } = await import('@/lib/activation')
    const result = await validateActivationKey()
    // Activation is now optional — no key means free tier, not locked out
    expect(result.valid).toBe(true)
    expect(result.tier).toBe('free')
  })

  it('caches the free-tier result in sessionStorage when no key is configured', async () => {
    vi.stubEnv('VITE_ACTIVATION_KEY', '')
    const { validateActivationKey } = await import('@/lib/activation')
    await validateActivationKey()
    const cached = sessionStorage.getItem('nk-activation-result')
    expect(cached).not.toBeNull()
    const parsed = JSON.parse(cached!)
    expect(parsed.valid).toBe(true)
    expect(parsed.tier).toBe('free')
  })

  it('returns cached result without making a network call', async () => {
    const cached = { valid: true, tier: 'premium', features: ['premium-themes'] }
    sessionStorage.setItem('nk-activation-result', JSON.stringify(cached))

    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { validateActivationKey } = await import('@/lib/activation')
    const result = await validateActivationKey()

    expect(result.valid).toBe(true)
    expect(result.tier).toBe('premium')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('returns invalid when the API call fails (network error)', async () => {
    vi.stubEnv('VITE_ACTIVATION_KEY', 'test-key-123')
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'))

    const { validateActivationKey } = await import('@/lib/activation')
    const result = await validateActivationKey()

    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/unavailable/i)
  })

  it('returns invalid when the API returns a non-ok status', async () => {
    vi.stubEnv('VITE_ACTIVATION_KEY', 'test-key-123')
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('{}', { status: 500 })
    )

    const { validateActivationKey } = await import('@/lib/activation')
    const result = await validateActivationKey()

    expect(result.valid).toBe(false)
  })

  it('returns valid result from successful API call', async () => {
    vi.stubEnv('VITE_ACTIVATION_KEY', 'valid-key-abc')
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ valid: true, tier: 'premium', features: ['premium-themes', 'premium-widgets'] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    const { validateActivationKey } = await import('@/lib/activation')
    const result = await validateActivationKey()

    expect(result.valid).toBe(true)
    expect(result.tier).toBe('premium')
    expect(result.features).toContain('premium-themes')
  })

  it('clearActivationCache removes the cached result', async () => {
    const cached = { valid: true, tier: 'free' }
    sessionStorage.setItem('nk-activation-result', JSON.stringify(cached))

    const { clearActivationCache } = await import('@/lib/activation')
    clearActivationCache()

    expect(sessionStorage.getItem('nk-activation-result')).toBeNull()
  })
})
