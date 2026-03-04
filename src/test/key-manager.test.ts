/**
 * Tests for the admin key manager API (api/admin/keys.ts).
 *
 * Tests use mocked KV and verify:
 * - Auth guard (401 without valid token)
 * - Primary-only guard (403 on non-primary instances)
 * - GET returns key list with masked values
 * - POST generates a key and stores metadata
 * - DELETE removes key from set and deletes metadata
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ─── Mock KV ──────────────────────────────────────────────────────────────────

const mockKv = {
  smembers: vi.fn(),
  sadd: vi.fn(),
  srem: vi.fn(),
  hgetall: vi.fn(),
  hset: vi.fn(),
  del: vi.fn(),
}

vi.mock('@vercel/kv', () => ({ kv: mockKv }))

// ─── Mock crypto ──────────────────────────────────────────────────────────────
// Don't mock crypto - let it work normally. We only need to verify the key is generated.

// ─── Request / Response helpers ───────────────────────────────────────────────

function makeReq(method: string, body?: Record<string, unknown>, authToken?: string) {
  return {
    method,
    body: body ?? {},
    headers: authToken ? { authorization: `Bearer ${authToken}` } : {},
  }
}

function makeRes() {
  const res = {
    _status: 200,
    _data: null as unknown,
    setHeader: vi.fn().mockReturnThis(),
    status: vi.fn().mockImplementation(function (this: ReturnType<typeof makeRes>, code: number) {
      this._status = code
      return this
    }),
    json: vi.fn().mockImplementation(function (this: ReturnType<typeof makeRes>, data: unknown) {
      this._data = data
      return this
    }),
    end: vi.fn().mockReturnThis(),
  }
  // Ensure `this` refers to the object for chained calls
  res.status = res.status.bind(res)
  res.json = res.json.bind(res)
  return res
}

// ─── Auth guard tests ─────────────────────────────────────────────────────────

describe('api/admin/keys auth guard', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_IS_PRIMARY', 'true')
    vi.stubEnv('ADMIN_TOKEN', 'secret-admin-token')
    mockKv.smembers.mockResolvedValue([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 401 when no Authorization header is provided', async () => {
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('GET')
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(401)
  })

  it('returns 401 when token is wrong', async () => {
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('GET', {}, 'wrong-token')
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(401)
  })

  it('allows access with correct token', async () => {
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('GET', {}, 'secret-admin-token')
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(200)
  })
})

// ─── Primary-only guard ───────────────────────────────────────────────────────

describe('api/admin/keys primary-only guard', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('ADMIN_TOKEN', 'secret-admin-token')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 403 when VITE_IS_PRIMARY is not true', async () => {
    vi.stubEnv('VITE_IS_PRIMARY', 'false')
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('GET', {}, 'secret-admin-token')
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(403)
  })

  it('returns 403 when VITE_IS_PRIMARY is not set', async () => {
    vi.stubEnv('VITE_IS_PRIMARY', '')
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('GET', {}, 'secret-admin-token')
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(403)
  })
})

// ─── GET /api/admin/keys ──────────────────────────────────────────────────────

describe('GET /api/admin/keys', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_IS_PRIMARY', 'true')
    vi.stubEnv('ADMIN_TOKEN', 'secret-admin-token')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns empty list when no keys exist', async () => {
    mockKv.smembers.mockResolvedValue([])
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('GET', {}, 'secret-admin-token')
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(200)
    expect((res._data as { keys: unknown[] }).keys).toHaveLength(0)
  })

  it('returns list with masked key values (only suffix)', async () => {
    mockKv.smembers.mockResolvedValue(['abcdef1234567890'])
    mockKv.hgetall.mockResolvedValue({ name: 'Test Key', tier: 'pro', createdAt: '2025-01-01' })
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('GET', {}, 'secret-admin-token')
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(200)
    const keys = (res._data as { keys: Array<{ name: string; tier: string; keySuffix: string }> }).keys
    expect(keys).toHaveLength(1)
    expect(keys[0].name).toBe('Test Key')
    expect(keys[0].tier).toBe('pro')
    // key suffix = last 4 chars of 'abcdef1234567890'
    expect(keys[0].keySuffix).toBe('7890')
    // Full key value must not be returned
    expect(JSON.stringify(keys)).not.toContain('abcdef1234567890')
  })
})

// ─── POST /api/admin/keys ─────────────────────────────────────────────────────

describe('POST /api/admin/keys', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_IS_PRIMARY', 'true')
    vi.stubEnv('ADMIN_TOKEN', 'secret-admin-token')
    mockKv.sadd.mockResolvedValue(1)
    mockKv.hset.mockResolvedValue(1)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('generates a key and returns it in the response', async () => {
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('POST', { name: 'My Key', tier: 'pro' }, 'secret-admin-token')
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(201)
    const data = res._data as { key: string; name: string; tier: string }
    expect(data.key).toBeTruthy()
    expect(data.name).toBe('My Key')
    expect(data.tier).toBe('pro')
  })

  it('stores the key in KV', async () => {
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('POST', { name: 'KV Test', tier: 'free' }, 'secret-admin-token')
    const res = makeRes()
    await handler(req as never, res as never)
    expect(mockKv.sadd).toHaveBeenCalledWith('activation-keys', expect.any(String))
    expect(mockKv.hset).toHaveBeenCalled()
  })

  it('returns 400 when name is empty', async () => {
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('POST', { name: '', tier: 'free' }, 'secret-admin-token')
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(400)
  })

  it('returns 400 for invalid tier', async () => {
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('POST', { name: 'Test', tier: 'ultra' }, 'secret-admin-token')
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(400)
  })
})

// ─── DELETE /api/admin/keys ───────────────────────────────────────────────────

describe('DELETE /api/admin/keys', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_IS_PRIMARY', 'true')
    vi.stubEnv('ADMIN_TOKEN', 'secret-admin-token')
    mockKv.srem.mockResolvedValue(1)
    mockKv.del.mockResolvedValue(1)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('removes the key from KV', async () => {
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('DELETE', { key: 'some-key-value' }, 'secret-admin-token')
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(200)
    expect(mockKv.srem).toHaveBeenCalledWith('activation-keys', 'some-key-value')
    expect(mockKv.del).toHaveBeenCalledWith('activation-key-meta:some-key-value')
  })

  it('returns 400 when key is empty', async () => {
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('DELETE', { key: '' }, 'secret-admin-token')
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(400)
  })

  it('returns 400 when key is missing', async () => {
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('DELETE', {}, 'secret-admin-token')
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(400)
  })
})

// ─── Method guard ─────────────────────────────────────────────────────────────

describe('api/admin/keys method guard', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_IS_PRIMARY', 'true')
    vi.stubEnv('ADMIN_TOKEN', 'secret-admin-token')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 405 for unsupported methods', async () => {
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('PATCH', {}, 'secret-admin-token')
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(405)
  })
})
