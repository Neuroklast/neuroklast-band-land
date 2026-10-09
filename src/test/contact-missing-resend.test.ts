import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/server-rate-limit', () => ({
  checkContactRateLimit: vi.fn(async () => true),
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
