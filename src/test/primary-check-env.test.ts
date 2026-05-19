/**
 * Step 4: Generalised primary-hostname detection.
 *
 * isPrimaryInstance() must:
 * - Return false by default when VITE_PRIMARY_HOSTNAMES is empty (no hostname is
 *   treated as primary unless the operator explicitly opts in).
 * - Return true when the current hostname appears in the comma-separated
 *   VITE_PRIMARY_HOSTNAMES env var.
 * - Still return true for the legacy hardcoded list when the env var is NOT set
 *   (backward-compat so existing Neuroklast deployments keep working).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('isPrimaryInstance — env-var driven', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true for neuroklast.net when VITE_PRIMARY_HOSTNAMES is NOT set (backward-compat)', async () => {
    // Do not stub — test the default behavior (env var absent)
    Object.defineProperty(window, 'location', {
      value: { hostname: 'neuroklast.net' },
      writable: true,
      configurable: true,
    })
    const { isPrimaryInstance } = await import('@/lib/primary-check')
    expect(isPrimaryInstance()).toBe(true)
  })

  it('returns false for neuroklast.net when VITE_PRIMARY_HOSTNAMES is set to an empty string', async () => {
    vi.stubEnv('VITE_PRIMARY_HOSTNAMES', '')
    Object.defineProperty(window, 'location', {
      value: { hostname: 'neuroklast.net' },
      writable: true,
      configurable: true,
    })
    const { isPrimaryInstance } = await import('@/lib/primary-check')
    expect(isPrimaryInstance()).toBe(false)
  })

  it('returns true when hostname matches VITE_PRIMARY_HOSTNAMES (custom deployment)', async () => {
    vi.stubEnv('VITE_PRIMARY_HOSTNAMES', 'my-band.com,www.my-band.com')
    Object.defineProperty(window, 'location', {
      value: { hostname: 'my-band.com' },
      writable: true,
      configurable: true,
    })
    const { isPrimaryInstance } = await import('@/lib/primary-check')
    expect(isPrimaryInstance()).toBe(true)
  })

  it('returns true when www hostname matches VITE_PRIMARY_HOSTNAMES', async () => {
    vi.stubEnv('VITE_PRIMARY_HOSTNAMES', 'my-band.com,www.my-band.com')
    Object.defineProperty(window, 'location', {
      value: { hostname: 'www.my-band.com' },
      writable: true,
      configurable: true,
    })
    const { isPrimaryInstance } = await import('@/lib/primary-check')
    expect(isPrimaryInstance()).toBe(true)
  })

  it('returns false when hostname does NOT match VITE_PRIMARY_HOSTNAMES', async () => {
    vi.stubEnv('VITE_PRIMARY_HOSTNAMES', 'my-band.com,www.my-band.com')
    Object.defineProperty(window, 'location', {
      value: { hostname: 'other-band.vercel.app' },
      writable: true,
      configurable: true,
    })
    const { isPrimaryInstance } = await import('@/lib/primary-check')
    expect(isPrimaryInstance()).toBe(false)
  })

  it('trims whitespace around entries in VITE_PRIMARY_HOSTNAMES', async () => {
    vi.stubEnv('VITE_PRIMARY_HOSTNAMES', ' my-band.com , www.my-band.com ')
    Object.defineProperty(window, 'location', {
      value: { hostname: 'my-band.com' },
      writable: true,
      configurable: true,
    })
    const { isPrimaryInstance } = await import('@/lib/primary-check')
    expect(isPrimaryInstance()).toBe(true)
  })
})
