import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock @vercel/kv — must be declared before importing the handler
// ---------------------------------------------------------------------------
const mockKvGet = vi.fn()
const mockKvSet = vi.fn()

vi.mock('@vercel/kv', () => ({
  kv: { get: mockKvGet, set: mockKvSet },
}))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Res = { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn>; end: ReturnType<typeof vi.fn> }

function mockRes(): Res {
  const res: Res = {
    status: vi.fn(),
    json: vi.fn(),
    end: vi.fn(),
  }
  res.status.mockReturnValue(res)
  res.json.mockReturnValue(res)
  res.end.mockReturnValue(res)
  return res
}

// We need a dynamic import so vi.mock is applied before the handler reads it
const { default: handler, timingSafeEqual } = await import('../../api/kv.js')

// ---------------------------------------------------------------------------
describe('KV API handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set env vars so isKVConfigured() returns true and the mocked kv is used
    process.env.KV_REST_API_URL = 'https://fake-kv.vercel.test'
    process.env.KV_REST_API_TOKEN = 'fake-token'
  })

  // ======= OPTIONS =======
  it('OPTIONS returns 200', async () => {
    const res = mockRes()
    await handler({ method: 'OPTIONS', query: {}, body: {}, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.end).toHaveBeenCalled()
  })

  // ======= GET =======
  describe('GET', () => {
    it('returns 400 when key is missing', async () => {
      const res = mockRes()
      await handler({ method: 'GET', query: {}, body: {}, headers: {} }, res)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'key is required' }))
    })

    it('returns value when key exists in KV', async () => {
      mockKvGet.mockResolvedValue({ name: 'NEUROKLAST' })
      const res = mockRes()
      await handler({ method: 'GET', query: { key: 'band-data' }, body: {}, headers: {} }, res)
      expect(mockKvGet).toHaveBeenCalledWith('band-data')
      expect(res.json).toHaveBeenCalledWith({ value: { name: 'NEUROKLAST' } })
    })

    it('returns null when key does not exist', async () => {
      mockKvGet.mockResolvedValue(undefined)
      const res = mockRes()
      await handler({ method: 'GET', query: { key: 'nonexistent' }, body: {}, headers: {} }, res)
      expect(res.json).toHaveBeenCalledWith({ value: null })
    })

    it('returns null when KV returns null', async () => {
      mockKvGet.mockResolvedValue(null)
      const res = mockRes()
      await handler({ method: 'GET', query: { key: 'empty' }, body: {}, headers: {} }, res)
      expect(res.json).toHaveBeenCalledWith({ value: null })
    })

    // Sensitive key protection tests
    it('returns 403 when reading admin-password-hash', async () => {
      const res = mockRes()
      await handler({ method: 'GET', query: { key: 'admin-password-hash' }, body: {}, headers: {} }, res)
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Forbidden' }))
      expect(mockKvGet).not.toHaveBeenCalled()
    })

    it('returns 403 when key contains "token"', async () => {
      const res = mockRes()
      await handler({ method: 'GET', query: { key: 'my-token-value' }, body: {}, headers: {} }, res)
      expect(res.status).toHaveBeenCalledWith(403)
    })

    it('returns 403 when key contains "secret"', async () => {
      const res = mockRes()
      await handler({ method: 'GET', query: { key: 'app-secret-key' }, body: {}, headers: {} }, res)
      expect(res.status).toHaveBeenCalledWith(403)
    })

    it('returns 403 for case-insensitive sensitive key patterns', async () => {
      const res = mockRes()
      await handler({ method: 'GET', query: { key: 'MY-SECRET-KEY' }, body: {}, headers: {} }, res)
      expect(res.status).toHaveBeenCalledWith(403)
    })

    it('returns 403 for case-insensitive admin-password-hash', async () => {
      const res = mockRes()
      await handler({ method: 'GET', query: { key: 'Admin-Password-Hash' }, body: {}, headers: {} }, res)
      expect(res.status).toHaveBeenCalledWith(403)
    })

    it('returns 500 when KV throws', async () => {
      mockKvGet.mockRejectedValue(new Error('KV unavailable'))
      const res = mockRes()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      await handler({ method: 'GET', query: { key: 'bad' }, body: {}, headers: {} }, res)
      expect(res.status).toHaveBeenCalledWith(500)
      consoleSpy.mockRestore()
    })
  })

  // ======= POST =======
  describe('POST', () => {
    it('returns 400 when body is missing', async () => {
      const res = mockRes()
      await handler({ method: 'POST', query: {}, body: null, headers: {} }, res)
      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('returns 400 when key is missing from body', async () => {
      const res = mockRes()
      await handler({ method: 'POST', query: {}, body: { value: 'x' }, headers: {} }, res)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'key is required' }))
    })

    it('returns 400 when value is undefined', async () => {
      const res = mockRes()
      await handler({ method: 'POST', query: {}, body: { key: 'test' }, headers: {} }, res)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'value is required' }))
    })

    it('saves value when no admin password is set', async () => {
      mockKvGet.mockResolvedValue(null) // no password in KV
      mockKvSet.mockResolvedValue('OK')
      const res = mockRes()
      await handler({
        method: 'POST',
        query: {},
        body: { key: 'band-data', value: { name: 'test' } },
        headers: {},
      }, res)
      expect(mockKvSet).toHaveBeenCalledWith('band-data', { name: 'test' })
      expect(res.json).toHaveBeenCalledWith({ success: true })
    })

    it('saves value with valid admin token', async () => {
      const hash = 'abc123'
      mockKvGet.mockResolvedValue(hash)
      mockKvSet.mockResolvedValue('OK')
      const res = mockRes()
      await handler({
        method: 'POST',
        query: {},
        body: { key: 'band-data', value: { name: 'updated' } },
        headers: { 'x-admin-token': hash },
      }, res)
      expect(mockKvSet).toHaveBeenCalledWith('band-data', { name: 'updated' })
      expect(res.json).toHaveBeenCalledWith({ success: true })
    })

    it('rejects write with invalid admin token', async () => {
      mockKvGet.mockResolvedValue('correct-hash')
      const res = mockRes()
      await handler({
        method: 'POST',
        query: {},
        body: { key: 'band-data', value: 'x' },
        headers: { 'x-admin-token': 'wrong-hash' },
      }, res)
      expect(res.status).toHaveBeenCalledWith(403)
      expect(mockKvSet).not.toHaveBeenCalled()
    })

    it('rejects write with missing admin token when password is set', async () => {
      mockKvGet.mockResolvedValue('some-hash')
      const res = mockRes()
      await handler({
        method: 'POST',
        query: {},
        body: { key: 'band-data', value: 'x' },
        headers: {},
      }, res)
      expect(res.status).toHaveBeenCalledWith(403)
      expect(mockKvSet).not.toHaveBeenCalled()
    })

    // Admin password key special handling
    describe('admin-password-hash key', () => {
      it('allows initial password setup without token', async () => {
        mockKvGet.mockResolvedValue(null) // no existing password
        mockKvSet.mockResolvedValue('OK')
        const res = mockRes()
        await handler({
          method: 'POST',
          query: {},
          body: { key: 'admin-password-hash', value: 'new-hash' },
          headers: {},
        }, res)
        expect(mockKvSet).toHaveBeenCalledWith('admin-password-hash', 'new-hash')
        expect(res.json).toHaveBeenCalledWith({ success: true })
      })

      it('allows password change with correct current token', async () => {
        const currentHash = 'current-hash'
        mockKvGet.mockResolvedValue(currentHash)
        mockKvSet.mockResolvedValue('OK')
        const res = mockRes()
        await handler({
          method: 'POST',
          query: {},
          body: { key: 'admin-password-hash', value: 'new-hash' },
          headers: { 'x-admin-token': currentHash },
        }, res)
        expect(mockKvSet).toHaveBeenCalledWith('admin-password-hash', 'new-hash')
      })

      it('rejects password change with wrong token', async () => {
        mockKvGet.mockResolvedValue('correct-hash')
        const res = mockRes()
        await handler({
          method: 'POST',
          query: {},
          body: { key: 'admin-password-hash', value: 'evil-hash' },
          headers: { 'x-admin-token': 'wrong-token' },
        }, res)
        expect(res.status).toHaveBeenCalledWith(403)
        expect(mockKvSet).not.toHaveBeenCalled()
      })
    })

    it('returns 500 when kv.set throws', async () => {
      mockKvGet.mockResolvedValue(null) // no password
      mockKvSet.mockRejectedValue(new Error('KV write failure'))
      const res = mockRes()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      await handler({
        method: 'POST',
        query: {},
        body: { key: 'test', value: 'data' },
        headers: {},
      }, res)
      expect(res.status).toHaveBeenCalledWith(500)
      consoleSpy.mockRestore()
    })
  })

  // ======= Unsupported methods =======
  it('returns 405 for unsupported methods', async () => {
    const res = mockRes()
    await handler({ method: 'DELETE', query: {}, body: {}, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(405)
  })

  it('returns 405 for PUT', async () => {
    const res = mockRes()
    await handler({ method: 'PUT', query: {}, body: {}, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(405)
  })
})

// ---------------------------------------------------------------------------
describe('timingSafeEqual', () => {
  it('returns true for identical strings', () => {
    expect(timingSafeEqual('abc', 'abc')).toBe(true)
  })

  it('returns false for different strings of same length', () => {
    expect(timingSafeEqual('abc', 'abd')).toBe(false)
  })

  it('returns false for different lengths', () => {
    expect(timingSafeEqual('abc', 'abcd')).toBe(false)
  })

  // Runtime type checks — intentionally passing non-string values
  it('returns false when a is not a string', () => {
    // @ts-expect-error testing runtime guard against non-string input
    expect(timingSafeEqual(123, 'abc')).toBe(false)
  })

  it('returns false when b is not a string', () => {
    // @ts-expect-error testing runtime guard against non-string input
    expect(timingSafeEqual('abc', null)).toBe(false)
  })

  it('returns true for empty strings', () => {
    expect(timingSafeEqual('', '')).toBe(true)
  })

  it('handles long hash-like strings', () => {
    const hash = 'a'.repeat(64)
    expect(timingSafeEqual(hash, hash)).toBe(true)
    expect(timingSafeEqual(hash, 'b'.repeat(64))).toBe(false)
  })
})
