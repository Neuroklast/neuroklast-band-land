import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { verifyContactTurnstile } from '@/lib/contact-turnstile'

describe('contact Turnstile verification', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'test-secret')
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'test-sitekey')
    vi.stubEnv('TURNSTILE_ALLOWED_HOSTNAMES', 'neuroklast.net')
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('rejects missing tokens and incomplete configuration', async () => {
    expect(await verifyContactTurnstile(new FormData())).toBe(false)
    vi.stubEnv('TURNSTILE_SECRET_KEY', '')
    expect(await verifyContactTurnstile(new FormData())).toBe(false)
  })

  it('rejects mismatched actions and hostnames', async () => {
    const form = new FormData()
    form.set('cf-turnstile-response', 'test-token')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, action: 'login', hostname: 'neuroklast.net' }),
    }))
    expect(await verifyContactTurnstile(form)).toBe(false)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, action: 'contact', hostname: 'malicious.example' }),
    }))
    expect(await verifyContactTurnstile(form)).toBe(false)
  })

  it('accepts only a valid contact token on an approved hostname', async () => {
    const form = new FormData()
    form.set('cf-turnstile-response', 'test-token')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, action: 'contact', hostname: 'neuroklast.net' }),
    }))
    expect(await verifyContactTurnstile(form)).toBe(true)
  })
})
