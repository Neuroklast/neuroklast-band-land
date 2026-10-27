import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/neurokore/server', () => ({
  user: vi.fn(),
  db: vi.fn(),
  limit: vi.fn().mockResolvedValue(undefined),
  json: (body: unknown, status = 200) => Response.json(body, { status }),
}))
vi.mock('@/lib/neurokore/protocol', () => ({ decryptKey: vi.fn() }))

import { user, db } from '@/lib/neurokore/server'
import { GET as getSession } from '@/app/api/neurokore/session/route'
import { GET as getLicences } from '@/app/api/neurokore/account/route'

describe('NEUROKORE customer sign-in and licence-service separation', () => {
  const previous = process.env.NEUROKORE_KEY_ENCRYPTION_SECRET
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(user).mockResolvedValue({ id: 'a', email: 'buyer@example.com' })
    delete process.env.NEUROKORE_KEY_ENCRYPTION_SECRET
  })
  afterEach(() => {
    if (previous === undefined) delete process.env.NEUROKORE_KEY_ENCRYPTION_SECRET
    else process.env.NEUROKORE_KEY_ENCRYPTION_SECRET = previous
  })
  it('remains signed in when the Preview has no licence encryption key', async () => {
    const session = await getSession()
    expect(session.status).toBe(200)
    expect(await session.json()).toEqual({ signedIn: true, email: 'buyer@example.com' })
    const licences = await getLicences(new Request('https://example.com/api/neurokore/account'))
    expect(licences.status).toBe(503)
    expect(vi.mocked(db)).not.toHaveBeenCalled()
  })
  it('reserves HTTP 401 exclusively for missing customer authentication', async () => {
    vi.mocked(user).mockRejectedValue(new Error('Sign in first'))
    expect((await getSession()).status).toBe(401)
    expect((await getLicences(new Request('https://example.com/api/neurokore/account'))).status).toBe(401)
  })
  it('loads an empty licence list normally when configured', async () => {
    process.env.NEUROKORE_KEY_ENCRYPTION_SECRET = 'test-secret'
    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    }
    vi.mocked(db).mockReturnValue({ from: vi.fn().mockReturnValue(query) } as unknown as ReturnType<typeof db>)
    const response = await getLicences(new Request('https://example.com/api/neurokore/account'))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ email: 'buyer@example.com', licenses: [] })
  })
})
