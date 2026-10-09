import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabaseAdmin', () => ({
  createAdminClient: () => ({
    rpc: vi.fn(async () => ({ data: null, error: { message: 'connection refused' } })),
  }),
}))

import { consumeRequestRateLimit } from '@/lib/rate-limit'

describe('consumeRequestRateLimit', () => {
  beforeEach(() => {
    delete process.env.RATE_LIMIT_SALT
  })

  it('throws when postgres cannot be consulted', async () => {
    await expect(
      consumeRequestRateLimit({
        namespace: 'contact',
        limit: 5,
        windowSeconds: 60,
        ip: '203.0.113.8',
        headers: new Headers(),
      }),
    ).rejects.toThrow(/connection refused/)
  })
})
