/**
 * Step 5: Activation key is optional.
 *
 * When NEXT_PUBLIC_ACTIVATION_KEY is not configured, validateActivationKey() must
 * return a valid free-tier result rather than blocking the app.  This lets
 * any operator run the band site without purchasing a key.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('validateActivationKey — optional activation (step 5)', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    sessionStorage.clear()
  })

  it('returns valid free-tier result when NEXT_PUBLIC_ACTIVATION_KEY is not set', async () => {
    vi.stubEnv('NEXT_PUBLIC_ACTIVATION_KEY', '')
    // Ensure not on primary hostname so that bypass does not interfere
    Object.defineProperty(window, 'location', {
      value: { hostname: 'my-custom-band.vercel.app' },
      writable: true,
      configurable: true,
    })
    const { validateActivationKey } = await import('@/lib/activation')
    const result = await validateActivationKey()
    expect(result.valid).toBe(true)
    expect(result.tier).toBe('free')
  })

  it('does not call the API when no key is configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_ACTIVATION_KEY', '')
    Object.defineProperty(window, 'location', {
      value: { hostname: 'my-custom-band.vercel.app' },
      writable: true,
      configurable: true,
    })
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { validateActivationKey } = await import('@/lib/activation')
    await validateActivationKey()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('still validates against API when a key IS configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_ACTIVATION_KEY', 'a-real-key')
    Object.defineProperty(window, 'location', {
      value: { hostname: 'my-custom-band.vercel.app' },
      writable: true,
      configurable: true,
    })
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ valid: true, tier: 'premium' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )
    const { validateActivationKey } = await import('@/lib/activation')
    const result = await validateActivationKey()
    expect(fetchSpy).toHaveBeenCalled()
    expect(result.valid).toBe(true)
    expect(result.tier).toBe('premium')
  })
})
