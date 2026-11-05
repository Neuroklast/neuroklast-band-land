import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/server-rate-limit', () => ({
  checkContactRateLimit: vi.fn(async () => true),
}))

// Contact persistence is optional for this test, but the spam configuration
// lookup must succeed before the action can attempt email delivery.
vi.mock('@/lib/neurokore/server', () => ({
  db: () => ({
    from: (table: string) => table === 'site_config'
      ? { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }
      : { insert: () => { throw new Error('Test support inbox unavailable') } },
  }),
}))

vi.mock('@/lib/api-secrets', () => ({
  getApiSecret: vi.fn(async () => null),
}))

import { submitContact } from '@/app/_actions/contact'

function form(): FormData {
  const data = new FormData()
  data.set('name', 'Ada')
  data.set('email', 'ada@example.com')
  data.set('subject', 'Booking')
  data.set('message', 'We want you to play.')
  return data
}

describe('submitContact without Resend', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('does not claim success in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    await expect(submitContact(null, form())).resolves.toEqual({ error: 'send_failed' })
  })

  it('still accepts the message in local dev', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    await expect(submitContact(null, form())).resolves.toEqual({ success: true })
  })
})
