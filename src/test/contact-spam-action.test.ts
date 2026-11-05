import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  config: { enabled: true, blockedWords: ['unwanted offer'] } as unknown,
  error: null as unknown,
  inserted: vi.fn(),
  resendKey: vi.fn(),
}))

vi.mock('@/lib/neurokore/server', () => ({
  db: () => ({
    from: (table: string) => {
      if (table === 'site_config') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: state.config === undefined ? null : { value: state.config },
                error: state.error,
              }),
            }),
          }),
        }
      }
      return { insert: state.inserted }
    },
  }),
}))

vi.mock('@/lib/server-rate-limit', () => ({
  checkContactRateLimit: vi.fn(async () => true),
}))

vi.mock('@/lib/api-secrets', () => ({
  getApiSecret: state.resendKey,
}))

import { submitContact } from '@/app/_actions/contact'

function form(subject: string, message: string): FormData {
  const formData = new FormData()
  formData.set('name', 'Example')
  formData.set('email', 'example@example.org')
  formData.set('subject', subject)
  formData.set('message', message)
  return formData
}

describe('contact spam rejection before delivery', () => {
  beforeEach(() => {
    state.config = { enabled: true, blockedWords: ['unwanted offer'] }
    state.error = null
    state.inserted.mockClear()
    state.resendKey.mockClear()
  })

  it('rejects a blacklisted phrase without storing or emailing the message', async () => {
    const result = await submitContact(null, form('Booking', 'An UNWANTED OFFER for you.'))
    expect(result).toEqual({ error: 'spam_suspected' })
    expect(state.inserted).not.toHaveBeenCalled()
    expect(state.resendKey).not.toHaveBeenCalled()
  })

  it('prioritizes explicit blacklist rejection over automatic sales-pitch screening', async () => {
    const result = await submitContact(null, form(
      'A free way to find new B2B clients',
      'We can find you B2B clients with our outreach platform. An unwanted offer.',
    ))
    expect(result).toEqual({ error: 'spam_suspected' })
    expect(state.inserted).not.toHaveBeenCalled()
    expect(state.resendKey).not.toHaveBeenCalled()
  })

  it('fails closed if the rule database cannot be read', async () => {
    state.error = { message: 'connection lost' }
    const result = await submitContact(null, form('Booking', 'A legitimate request.'))
    expect(result).toEqual({ error: 'send_failed' })
    expect(state.inserted).not.toHaveBeenCalled()
    expect(state.resendKey).not.toHaveBeenCalled()
  })

  it('fails closed for invalid persisted rules', async () => {
    state.config = { enabled: 'unexpected', blockedWords: [] }
    const result = await submitContact(null, form('Booking', 'A legitimate request.'))
    expect(result).toEqual({ error: 'send_failed' })
    expect(state.inserted).not.toHaveBeenCalled()
  })
})
