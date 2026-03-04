/**
 * Tests for activation key validation logic (src/lib/activation.ts)
 * and license tier utilities (src/lib/license.ts).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { tierAtLeast, hasFeature, TIER_LABELS, TIER_ORDER } from '@/lib/license'

// ─── License tier utilities ───────────────────────────────────────────────────

describe('tierAtLeast', () => {
  it('free meets free', () => expect(tierAtLeast('free', 'free')).toBe(true))
  it('free does not meet pro', () => expect(tierAtLeast('free', 'pro')).toBe(false))
  it('pro meets free', () => expect(tierAtLeast('pro', 'free')).toBe(true))
  it('pro meets pro', () => expect(tierAtLeast('pro', 'pro')).toBe(true))
  it('pro does not meet agency', () => expect(tierAtLeast('pro', 'agency')).toBe(false))
  it('agency meets pro', () => expect(tierAtLeast('agency', 'pro')).toBe(true))
  it('saas meets agency', () => expect(tierAtLeast('saas', 'agency')).toBe(true))
  it('saas meets saas', () => expect(tierAtLeast('saas', 'saas')).toBe(true))
})

describe('hasFeature', () => {
  it('free has no premium features', () => {
    expect(hasFeature('free', 'premium-themes')).toBe(false)
    expect(hasFeature('free', 'widgets')).toBe(false)
    expect(hasFeature('free', 'analytics')).toBe(false)
  })

  it('pro has premium-themes, widgets, analytics', () => {
    expect(hasFeature('pro', 'premium-themes')).toBe(true)
    expect(hasFeature('pro', 'widgets')).toBe(true)
    expect(hasFeature('pro', 'analytics')).toBe(true)
  })

  it('pro does not have multi-site', () => {
    expect(hasFeature('pro', 'multi-site')).toBe(false)
  })

  it('agency has multi-site', () => {
    expect(hasFeature('agency', 'multi-site')).toBe(true)
  })

  it('saas has hosted and white-label', () => {
    expect(hasFeature('saas', 'hosted')).toBe(true)
    expect(hasFeature('saas', 'white-label')).toBe(true)
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

  it('returns invalid when VITE_ACTIVATION_KEY is not set', async () => {
    vi.stubEnv('VITE_ACTIVATION_KEY', '')
    const { validateActivationKey } = await import('@/lib/activation')
    const result = await validateActivationKey()
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/no activation key/i)
  })

  it('bypasses validation when VITE_IS_PRIMARY is true', async () => {
    vi.stubEnv('VITE_IS_PRIMARY', 'true')
    vi.stubEnv('VITE_ACTIVATION_KEY', '')
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { validateActivationKey } = await import('@/lib/activation')
    const result = await validateActivationKey()
    expect(result.valid).toBe(true)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('does not bypass validation when VITE_IS_PRIMARY is not true', async () => {
    vi.stubEnv('VITE_IS_PRIMARY', 'false')
    vi.stubEnv('VITE_ACTIVATION_KEY', '')
    const { validateActivationKey } = await import('@/lib/activation')
    const result = await validateActivationKey()
    expect(result.valid).toBe(false)
  })

  it('caches an invalid result in sessionStorage', async () => {
    vi.stubEnv('VITE_ACTIVATION_KEY', '')
    const { validateActivationKey } = await import('@/lib/activation')
    await validateActivationKey()
    const cached = sessionStorage.getItem('nk-activation-result')
    expect(cached).not.toBeNull()
    const parsed = JSON.parse(cached!)
    expect(parsed.valid).toBe(false)
  })

  it('returns cached result without making a network call', async () => {
    const cached = { valid: true, tier: 'pro', features: ['premium-themes'] }
    sessionStorage.setItem('nk-activation-result', JSON.stringify(cached))

    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { validateActivationKey } = await import('@/lib/activation')
    const result = await validateActivationKey()

    expect(result.valid).toBe(true)
    expect(result.tier).toBe('pro')
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
      new Response(JSON.stringify({ valid: true, tier: 'pro', features: ['premium-themes', 'widgets'] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    const { validateActivationKey } = await import('@/lib/activation')
    const result = await validateActivationKey()

    expect(result.valid).toBe(true)
    expect(result.tier).toBe('pro')
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
