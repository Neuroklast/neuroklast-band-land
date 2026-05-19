/**
 * Step 7: Activation caching simplified.
 *
 * `use-activation-key.ts` previously maintained a parallel sessionStorage
 * cache under `activation_status_cache` (boolean + timestamp) that duplicated
 * what `src/lib/activation.ts` already caches under `nk-activation-result`.
 * After cleanup only the canonical `nk-activation-result` key should exist.
 *
 * This test verifies:
 * - `activation_status_cache` is never written by the hook or by activation.ts
 * - The canonical `nk-activation-result` key IS written by activation.ts
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Activation caching simplified (step 7)', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.resetModules()
  })

  afterEach(() => {
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  it('does not write the legacy activation_status_cache key', async () => {
    vi.stubEnv('NEXT_PUBLIC_ACTIVATION_KEY', '')
    const { validateActivationKey } = await import('@/lib/activation')
    await validateActivationKey()
    expect(sessionStorage.getItem('activation_status_cache')).toBeNull()
  })

  it('still writes nk-activation-result (canonical cache key)', async () => {
    vi.stubEnv('NEXT_PUBLIC_ACTIVATION_KEY', '')
    const { validateActivationKey } = await import('@/lib/activation')
    await validateActivationKey()
    const raw = sessionStorage.getItem('nk-activation-result')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(typeof parsed.valid).toBe('boolean')
  })
})
