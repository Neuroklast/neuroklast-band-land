/**
 * Tests for the admin key manager API (api/admin/keys.ts).
 *
 * Tests use mocked KV and verify:
 * - Auth guard (401 without valid session)
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
  set: vi.fn(),
  get: vi.fn(),
}

vi.mock('@vercel/kv', () => ({ kv: mockKv }))

// ─── Mock session validation ──────────────────────────────────────────────────

const mockValidateSession = vi.fn()

vi.mock('../../api/auth.js', () => ({
  validateSession: (...args: unknown[]) => mockValidateSession(...args),
}))

// ─── Mock crypto ──────────────────────────────────────────────────────────────
// Don't mock crypto - let it work normally. We only need to verify the key is generated.

// ─── Request / Response helpers ───────────────────────────────────────────────

function makeReq(method: string, body?: Record<string, unknown>, authenticated = false, host = 'neuroklast.net') {
  return {
    method,
    body: body ?? {},
    headers: {
      host,
      ...(authenticated ? { cookie: 'nk-session=valid-session-token' } : {}),
    },
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
    mockKv.smembers.mockResolvedValue([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 401 when session is not valid', async () => {
    mockValidateSession.mockResolvedValue(false)
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('GET')
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(401)
  })

  it('returns 401 when session cookie is missing', async () => {
    mockValidateSession.mockResolvedValue(false)
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('GET')
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(401)
  })

  it('allows access with valid session', async () => {
    mockValidateSession.mockResolvedValue(true)
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('GET', {}, true)
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(200)
  })
})

// ─── Primary-only guard ───────────────────────────────────────────────────────

describe('api/admin/keys primary-only guard', () => {
  beforeEach(() => {
    vi.resetModules()
    mockValidateSession.mockResolvedValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 403 when host is not a primary hostname', async () => {
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('GET', {}, true, 'other-tenant.vercel.app')
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(403)
  })

  it('returns 403 when host header is missing', async () => {
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('GET', {}, true, '')
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(403)
  })
})

// ─── GET /api/admin/keys ──────────────────────────────────────────────────────

describe('GET /api/admin/keys', () => {
  beforeEach(() => {
    vi.resetModules()
    mockValidateSession.mockResolvedValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns empty list when no keys exist', async () => {
    mockKv.smembers.mockResolvedValue([])
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('GET', {}, true)
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(200)
    expect((res._data as { keys: unknown[] }).keys).toHaveLength(0)
  })

  it('returns list with revokeId (not the key value)', async () => {
    mockKv.smembers.mockResolvedValue(['abcdef1234567890'])
    mockKv.hgetall.mockResolvedValue({ name: 'Test Key', tier: 'premium', createdAt: '2025-01-01', revokeId: 'revoke-uuid-abc' })
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('GET', {}, true)
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(200)
    const keys = (res._data as { keys: Array<{ name: string; tier: string; revokeId: string }> }).keys
    expect(keys).toHaveLength(1)
    expect(keys[0].name).toBe('Test Key')
    expect(keys[0].tier).toBe('premium')
    expect(keys[0].revokeId).toBe('revoke-uuid-abc')
    // Full key value must not be returned
    expect(JSON.stringify(keys)).not.toContain('abcdef1234567890')
  })
})

// ─── POST /api/admin/keys ─────────────────────────────────────────────────────

describe('POST /api/admin/keys', () => {
  beforeEach(() => {
    vi.resetModules()
    mockValidateSession.mockResolvedValue(true)
    mockKv.sadd.mockResolvedValue(1)
    mockKv.hset.mockResolvedValue(1)
    mockKv.set.mockResolvedValue('OK')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('generates a key and returns it in the response (with revokeId)', async () => {
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('POST', { name: 'My Key', tier: 'premium' }, true)
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(201)
    const data = res._data as { key: string; revokeId: string; name: string; tier: string }
    expect(data.key).toBeTruthy()
    expect(data.revokeId).toBeTruthy()
    expect(data.name).toBe('My Key')
    expect(data.tier).toBe('premium')
  })

  it('stores the key in KV', async () => {
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('POST', { name: 'KV Test', tier: 'free' }, true)
    const res = makeRes()
    await handler(req as never, res as never)
    expect(mockKv.sadd).toHaveBeenCalledWith('activation-keys', expect.any(String))
    expect(mockKv.hset).toHaveBeenCalled()
    // Also stores revokeId → key mapping
    expect(mockKv.set).toHaveBeenCalled()
  })

  it('returns 400 when name is empty', async () => {
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('POST', { name: '', tier: 'free' }, true)
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(400)
  })

  it('returns 400 for invalid tier', async () => {
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('POST', { name: 'Test', tier: 'ultra' }, true)
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(400)
  })
})

// ─── DELETE /api/admin/keys ───────────────────────────────────────────────────

describe('DELETE /api/admin/keys', () => {
  beforeEach(() => {
    vi.resetModules()
    mockValidateSession.mockResolvedValue(true)
    mockKv.srem.mockResolvedValue(1)
    mockKv.del.mockResolvedValue(1)
    mockKv.get.mockResolvedValue('actual-key-value')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('removes the key from KV using revokeId', async () => {
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('DELETE', { revokeId: 'some-revoke-id' }, true)
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(200)
    // Uses the revokeId to look up the key, then removes it
    expect(mockKv.get).toHaveBeenCalledWith('activation-revoke:some-revoke-id')
    expect(mockKv.srem).toHaveBeenCalledWith('activation-keys', 'actual-key-value')
    expect(mockKv.del).toHaveBeenCalledWith('activation-key-meta:actual-key-value')
  })

  it('returns 400 when revokeId is empty', async () => {
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('DELETE', { revokeId: '' }, true)
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(400)
  })

  it('returns 400 when revokeId is missing', async () => {
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('DELETE', {}, true)
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(400)
  })

  it('returns 404 when revokeId not found in KV', async () => {
    mockKv.get.mockResolvedValue(null)
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('DELETE', { revokeId: 'unknown-id' }, true)
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(404)
  })
})

// ─── Method guard ─────────────────────────────────────────────────────────────

describe('api/admin/keys method guard', () => {
  beforeEach(() => {
    vi.resetModules()
    mockValidateSession.mockResolvedValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 405 for unsupported methods', async () => {
    const { default: handler } = await import('../../api/admin/keys')
    const req = makeReq('PUT', {}, true)
    const res = makeRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(405)
  })
})
