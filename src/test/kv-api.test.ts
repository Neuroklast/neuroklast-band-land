import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock @vercel/kv — must be declared before importing the handler
// ---------------------------------------------------------------------------
const mockKvGet = vi.fn()
const mockKvSet = vi.fn()

vi.mock('@vercel/kv', () => ({
  kv: { get: mockKvGet, set: mockKvSet },
}))

// Mock rate limiter — always allow requests in tests
vi.mock('../../api/_ratelimit.js', () => ({
  applyRateLimit: vi.fn().mockResolvedValue(true),
}))

// Mock honeytokens — disable in tests
vi.mock('../../api/_honeytokens.js', () => ({
  isHoneytoken: vi.fn().mockReturnValue(false),
  triggerHoneytokenAlarm: vi.fn().mockResolvedValue(undefined),
  isMarkedAttacker: vi.fn().mockResolvedValue(false),
  injectEntropyHeaders: vi.fn(),
  getRandomTaunt: vi.fn().mockReturnValue('test-taunt'),
  setDefenseHeaders: vi.fn(),
}))

// Mock auth.js — session-based auth
const mockValidateSession = vi.fn()
vi.mock('../../api/auth.js', () => ({
  validateSession: mockValidateSession,
}))

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
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Required' }))
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
      await handler({ method: 'GET', query: { key: 'band-data' }, body: {}, headers: {} }, res)
      expect(res.json).toHaveBeenCalledWith({ value: null })
    })

    it('returns null when KV returns null', async () => {
      mockKvGet.mockResolvedValue(null)
      const res = mockRes()
      await handler({ method: 'GET', query: { key: 'band-data' }, body: {}, headers: {} }, res)
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
      await handler({ method: 'GET', query: { key: 'band-data' }, body: {}, headers: {} }, res)
      expect(res.status).toHaveBeenCalledWith(500)
      consoleSpy.mockRestore()
    })

    // Terminal commands stripping for public reads
    it('strips terminalCommands from band-data for unauthenticated reads', async () => {
      mockValidateSession.mockResolvedValue(false)
      mockKvGet.mockResolvedValue({
        name: 'NEUROKLAST',
        terminalCommands: [{ name: 'secret', output: ['TOP SECRET'] }],
      })
      const res = mockRes()
      await handler({ method: 'GET', query: { key: 'band-data' }, body: {}, headers: {} }, res)
      const returned = res.json.mock.calls[0][0].value
      expect(returned.name).toBe('NEUROKLAST')
      expect(returned.terminalCommands).toBeUndefined()
    })

    it('includes terminalCommands in band-data for authenticated reads', async () => {
      mockValidateSession.mockResolvedValue(true)
      const commands = [{ name: 'secret', output: ['TOP SECRET'] }]
      mockKvGet.mockResolvedValue({ name: 'NEUROKLAST', terminalCommands: commands })
      const res = mockRes()
      await handler({ method: 'GET', query: { key: 'band-data' }, body: {}, headers: {} }, res)
      const returned = res.json.mock.calls[0][0].value
      expect(returned.terminalCommands).toEqual(commands)
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
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Required' }))
    })

    it('returns 400 when value is undefined', async () => {
      const res = mockRes()
      await handler({ method: 'POST', query: {}, body: { key: 'test' }, headers: {} }, res)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'value is required' }))
    })

    it('saves value with valid session', async () => {
      mockValidateSession.mockResolvedValue(true)
      mockKvSet.mockResolvedValue('OK')
      mockKvGet.mockResolvedValue(null)
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

    it('saves value with valid session (no x-admin-token needed)', async () => {
      mockValidateSession.mockResolvedValue(true)
      mockKvSet.mockResolvedValue('OK')
      mockKvGet.mockResolvedValue(null)
      const res = mockRes()
      await handler({
        method: 'POST',
        query: {},
        body: { key: 'band-data', value: { name: 'updated' } },
        headers: {},
      }, res)
      expect(mockKvSet).toHaveBeenCalledWith('band-data', { name: 'updated' })
      expect(res.json).toHaveBeenCalledWith({ success: true })
    })

    it('rejects write with invalid session', async () => {
      mockValidateSession.mockResolvedValue(false)
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

    it('rejects write with no valid session', async () => {
      mockValidateSession.mockResolvedValue(false)
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

    // Admin password key — direct writes blocked
    describe('admin-password-hash key', () => {
      it('blocks direct write to admin-password-hash (use /api/auth)', async () => {
        const res = mockRes()
        await handler({
          method: 'POST',
          query: {},
          body: { key: 'admin-password-hash', value: 'new-hash' },
          headers: {},
        }, res)
        expect(res.status).toHaveBeenCalledWith(403)
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('/api/auth') }))
        expect(mockKvSet).not.toHaveBeenCalled()
      })

      it('blocks direct write to admin-password-hash even with valid session', async () => {
        mockValidateSession.mockResolvedValue(true)
        const res = mockRes()
        await handler({
          method: 'POST',
          query: {},
          body: { key: 'admin-password-hash', value: 'new-hash' },
          headers: {},
        }, res)
        expect(res.status).toHaveBeenCalledWith(403)
        expect(mockKvSet).not.toHaveBeenCalled()
      })

      it('blocks direct password change via KV API (use /api/auth)', async () => {
        const res = mockRes()
        await handler({
          method: 'POST',
          query: {},
          body: { key: 'admin-password-hash', value: 'evil-hash' },
          headers: {},
        }, res)
        expect(res.status).toHaveBeenCalledWith(403)
        expect(mockKvSet).not.toHaveBeenCalled()
      })
    })

    // secretCode preservation — must not be stripped by the /secret/i sanitizer
    it('preserves secretCode in band-data writes', async () => {
      mockValidateSession.mockResolvedValue(true)
      mockKvSet.mockResolvedValue('OK')
      const res = mockRes()
      await handler({
        method: 'POST',
        query: {},
        body: { key: 'band-data', value: { name: 'NK', secretCode: ['ArrowUp', 'ArrowDown'] } },
        headers: {},
      }, res)
      const savedValue = mockKvSet.mock.calls[0][1]
      expect(savedValue.secretCode).toEqual(['ArrowUp', 'ArrowDown'])
      expect(res.json).toHaveBeenCalledWith({ success: true })
    })

    // terminalCommands preservation — must be merged from existing KV data
    it('preserves terminalCommands from existing KV data when not provided in write', async () => {
      mockValidateSession.mockResolvedValue(true)
      mockKvSet.mockResolvedValue('OK')
      const existingCommands = [{ name: 'status', output: ['ACTIVE'] }]
      mockKvGet.mockResolvedValue({ name: 'NK', terminalCommands: existingCommands })
      const res = mockRes()
      await handler({
        method: 'POST',
        query: {},
        body: { key: 'band-data', value: { name: 'NK-Updated' } },
        headers: {},
      }, res)
      const savedValue = mockKvSet.mock.calls[0][1]
      expect(savedValue.terminalCommands).toEqual(existingCommands)
      expect(savedValue.name).toBe('NK-Updated')
      expect(res.json).toHaveBeenCalledWith({ success: true })
    })

    it('does not overwrite terminalCommands when explicitly provided in write', async () => {
      mockValidateSession.mockResolvedValue(true)
      mockKvSet.mockResolvedValue('OK')
      const newCommands = [{ name: 'info', output: ['INFO'] }]
      const res = mockRes()
      await handler({
        method: 'POST',
        query: {},
        body: { key: 'band-data', value: { name: 'NK', terminalCommands: newCommands } },
        headers: {},
      }, res)
      const savedValue = mockKvSet.mock.calls[0][1]
      expect(savedValue.terminalCommands).toEqual(newCommands)
      // Should not have read from KV for existing data
      expect(mockKvGet).not.toHaveBeenCalled()
    })

    it('returns 500 when kv.set throws', async () => {
      mockValidateSession.mockResolvedValue(true)
      mockKvSet.mockRejectedValue(new Error('KV write failure'))
      const res = mockRes()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      await handler({
        method: 'POST',
        query: {},
        body: { key: 'band-data', value: 'data' },
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
