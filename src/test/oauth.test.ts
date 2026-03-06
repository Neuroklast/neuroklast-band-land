import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock @vercel/kv — must be declared before importing the handler
// ---------------------------------------------------------------------------
const mockKvGet = vi.fn()
const mockKvSet = vi.fn()
const mockKvDel = vi.fn()

vi.mock('@vercel/kv', () => ({
  kv: {
    get: mockKvGet,
    set: mockKvSet,
    del: mockKvDel,
  },
}))

// Mock rate limiter — always allow requests in tests
vi.mock('../../api/_ratelimit.js', () => ({
  applyRateLimit: vi.fn().mockResolvedValue(true),
  getClientIp: vi.fn().mockReturnValue('1.2.3.4'),
}))

// Mock validateSession — controlled per test
const mockValidateSession = vi.fn()
vi.mock('../../api/auth.js', () => ({
  validateSession: mockValidateSession,
}))

type Res = {
  status: ReturnType<typeof vi.fn>
  json: ReturnType<typeof vi.fn>
  end: ReturnType<typeof vi.fn>
  setHeader: ReturnType<typeof vi.fn>
  send: ReturnType<typeof vi.fn>
}

function mockRes(): Res {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
    end: vi.fn(),
    setHeader: vi.fn(),
    send: vi.fn(),
  }
  res.status.mockReturnValue(res)
  return res
}

const ENCRYPTION_KEY = 'a'.repeat(64) // 32 bytes as hex

const { default: handler, encryptToken, decryptToken, PROVIDERS, appendOAuthLog: _appendOAuthLog } = await import('../../api/oauth.js')

// ---------------------------------------------------------------------------
describe('OAuth encryption helpers', () => {
  beforeEach(() => {
    process.env.OAUTH_ENCRYPTION_KEY = ENCRYPTION_KEY
    process.env.KV_REST_API_URL = 'https://fake-kv.vercel.test'
    process.env.KV_REST_API_TOKEN = 'fake-token'
  })

  it('encrypts and decrypts a token round-trip', () => {
    const data = { accessToken: 'abc123', email: 'user@example.com', connectedAt: '2024-01-01' }
    const encrypted = encryptToken(data)
    expect(typeof encrypted).toBe('string')
    const decrypted = decryptToken(encrypted)
    expect(decrypted).toEqual(data)
  })

  it('throws if OAUTH_ENCRYPTION_KEY is missing', () => {
    const orig = process.env.OAUTH_ENCRYPTION_KEY
    delete process.env.OAUTH_ENCRYPTION_KEY
    expect(() => encryptToken({ foo: 'bar' })).toThrow('OAUTH_ENCRYPTION_KEY is not configured')
    process.env.OAUTH_ENCRYPTION_KEY = orig
  })

  it('throws if OAUTH_ENCRYPTION_KEY is wrong length', () => {
    process.env.OAUTH_ENCRYPTION_KEY = 'deadbeef' // too short
    expect(() => encryptToken({ foo: 'bar' })).toThrow('OAUTH_ENCRYPTION_KEY must be 64 hex characters')
    process.env.OAUTH_ENCRYPTION_KEY = ENCRYPTION_KEY
  })
})

// ---------------------------------------------------------------------------
describe('PROVIDERS config', () => {
  it('has spotify and google-drive entries', () => {
    expect(PROVIDERS).toHaveProperty('spotify')
    expect(PROVIDERS).toHaveProperty('google-drive')
  })

  it('spotify has required fields', () => {
    const p = PROVIDERS['spotify']
    expect(p.name).toBe('Spotify')
    expect(p.authUrl).toContain('accounts.spotify.com')
    expect(p.tokenUrl).toContain('accounts.spotify.com')
    expect(typeof p.clientId).toBe('function')
    expect(typeof p.clientSecret).toBe('function')
  })

  it('google-drive has required fields', () => {
    const p = PROVIDERS['google-drive']
    expect(p.name).toBe('Google Drive')
    expect(p.authUrl).toContain('accounts.google.com')
    expect(p.tokenUrl).toContain('googleapis.com')
    expect(typeof p.clientId).toBe('function')
    expect(typeof p.clientSecret).toBe('function')
  })
})

// ---------------------------------------------------------------------------
describe('OAuth handler: GET status', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.OAUTH_ENCRYPTION_KEY = ENCRYPTION_KEY
    process.env.KV_REST_API_URL = 'https://fake-kv.vercel.test'
    process.env.KV_REST_API_TOKEN = 'fake-token'
  })

  it('returns 401 when not authenticated', async () => {
    mockValidateSession.mockResolvedValue(false)
    const res = mockRes()
    await handler({ method: 'GET', query: { action: 'status' }, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' })
  })

  it('returns provider statuses when authenticated with no connections', async () => {
    mockValidateSession.mockResolvedValue(true)
    mockKvGet.mockResolvedValue(null)
    const res = mockRes()
    await handler({ method: 'GET', query: { action: 'status' }, headers: {} }, res)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statuses: expect.objectContaining({
          spotify: { connected: false },
          'google-drive': { connected: false },
        }),
        logs: [],
      }),
    )
  })

  it('returns connected status for a provider with stored token', async () => {
    mockValidateSession.mockResolvedValue(true)
    const tokenRecord = {
      accessToken: 'tok123',
      displayName: 'DJ Test',
      email: 'test@example.com',
      connectedAt: '2024-01-01T00:00:00.000Z',
      provider: 'spotify',
    }
    const encrypted = encryptToken(tokenRecord)

    mockKvGet.mockImplementation(async (key: string) => {
      if (key === 'oauth:token:spotify') return encrypted
      return null
    })

    const res = mockRes()
    await handler({ method: 'GET', query: { action: 'status' }, headers: {} }, res)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statuses: expect.objectContaining({
          spotify: expect.objectContaining({
            connected: true,
            displayName: 'DJ Test',
            email: 'test@example.com',
          }),
        }),
      }),
    )
  })
})

// ---------------------------------------------------------------------------
describe('OAuth handler: GET authorize', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.OAUTH_ENCRYPTION_KEY = ENCRYPTION_KEY
    process.env.KV_REST_API_URL = 'https://fake-kv.vercel.test'
    process.env.KV_REST_API_TOKEN = 'fake-token'
    process.env.SPOTIFY_CLIENT_ID = 'test-spotify-client-id'
    process.env.SPOTIFY_CLIENT_SECRET = 'test-spotify-secret'
    process.env.GOOGLE_CLIENT_ID = 'test-google-client-id'
    process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret'
    process.env.OAUTH_APP_URL = 'https://example.com'
  })

  it('returns 401 when not authenticated', async () => {
    mockValidateSession.mockResolvedValue(false)
    const res = mockRes()
    await handler(
      { method: 'GET', query: { action: 'authorize', provider: 'spotify' }, headers: {} },
      res,
    )
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns 400 for invalid provider', async () => {
    mockValidateSession.mockResolvedValue(true)
    const res = mockRes()
    await handler(
      { method: 'GET', query: { action: 'authorize', provider: 'unknown' }, headers: {} },
      res,
    )
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid provider' })
  })

  it('returns 503 when credentials not configured', async () => {
    mockValidateSession.mockResolvedValue(true)
    delete process.env.SPOTIFY_CLIENT_ID
    const res = mockRes()
    await handler(
      { method: 'GET', query: { action: 'authorize', provider: 'spotify' }, headers: {} },
      res,
    )
    expect(res.status).toHaveBeenCalledWith(503)
  })

  it('returns auth URL and stores state for spotify', async () => {
    mockValidateSession.mockResolvedValue(true)
    mockKvSet.mockResolvedValue('OK')
    const res = mockRes()
    await handler(
      {
        method: 'GET',
        query: { action: 'authorize', provider: 'spotify' },
        headers: { host: 'example.com' },
      },
      res,
    )
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ authUrl: expect.stringContaining('accounts.spotify.com') }),
    )
    expect(mockKvSet).toHaveBeenCalledWith(
      expect.stringMatching(/^oauth:state:/),
      expect.objectContaining({ provider: 'spotify' }),
      { ex: 300 },
    )
  })

  it('returns auth URL for google-drive with offline access', async () => {
    mockValidateSession.mockResolvedValue(true)
    mockKvSet.mockResolvedValue('OK')
    const res = mockRes()
    await handler(
      {
        method: 'GET',
        query: { action: 'authorize', provider: 'google-drive' },
        headers: { host: 'example.com' },
      },
      res,
    )
    const callArg = res.json.mock.calls[0][0]
    expect(callArg.authUrl).toContain('accounts.google.com')
    expect(callArg.authUrl).toContain('access_type=offline')
  })
})

// ---------------------------------------------------------------------------
describe('OAuth handler: GET callback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.OAUTH_ENCRYPTION_KEY = ENCRYPTION_KEY
    process.env.KV_REST_API_URL = 'https://fake-kv.vercel.test'
    process.env.KV_REST_API_TOKEN = 'fake-token'
    process.env.SPOTIFY_CLIENT_ID = 'test-spotify-client-id'
    process.env.SPOTIFY_CLIENT_SECRET = 'test-spotify-secret'
    process.env.OAUTH_APP_URL = 'https://example.com'
  })

  it('handles OAuth provider error', async () => {
    mockKvGet.mockResolvedValue(null)
    mockKvSet.mockResolvedValue('OK')
    const res = mockRes()
    await handler(
      {
        method: 'GET',
        query: { action: 'callback', provider: 'spotify', error: 'access_denied', state: 'abc', code: '' },
        headers: {},
      },
      res,
    )
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith(expect.stringContaining('oauth-callback'))
  })

  it('returns 403 for invalid state', async () => {
    mockKvGet.mockResolvedValue(null) // state not found
    const res = mockRes()
    await handler(
      {
        method: 'GET',
        query: { action: 'callback', provider: 'spotify', code: 'auth-code', state: 'invalid-state' },
        headers: {},
      },
      res,
    )
    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('returns 403 if state provider mismatch', async () => {
    mockKvGet.mockResolvedValue({ provider: 'google-drive', ip: '1.2.3.4' }) // state belongs to different provider
    const res = mockRes()
    await handler(
      {
        method: 'GET',
        query: { action: 'callback', provider: 'spotify', code: 'auth-code', state: 'valid-state' },
        headers: {},
      },
      res,
    )
    expect(res.status).toHaveBeenCalledWith(403)
  })
})

// ---------------------------------------------------------------------------
describe('OAuth handler: POST disconnect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.KV_REST_API_URL = 'https://fake-kv.vercel.test'
    process.env.KV_REST_API_TOKEN = 'fake-token'
  })

  it('returns 401 when not authenticated', async () => {
    mockValidateSession.mockResolvedValue(false)
    const res = mockRes()
    await handler(
      {
        method: 'POST',
        body: { action: 'disconnect', provider: 'spotify' },
        headers: { 'user-agent': 'test' },
        query: {},
      },
      res,
    )
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('deletes token and logs disconnect', async () => {
    mockValidateSession.mockResolvedValue(true)
    mockKvDel.mockResolvedValue(1)
    mockKvGet.mockResolvedValue([]) // existing logs
    mockKvSet.mockResolvedValue('OK')
    const res = mockRes()
    await handler(
      {
        method: 'POST',
        body: { action: 'disconnect', provider: 'spotify' },
        headers: { 'user-agent': 'test' },
        query: {},
      },
      res,
    )
    expect(mockKvDel).toHaveBeenCalledWith('oauth:token:spotify')
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })

  it('returns 400 for invalid provider', async () => {
    mockValidateSession.mockResolvedValue(true)
    const res = mockRes()
    await handler(
      {
        method: 'POST',
        body: { action: 'disconnect', provider: 'unknown' },
        headers: { 'user-agent': 'test' },
        query: {},
      },
      res,
    )
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid provider' })
  })

  it('returns 400 for invalid action', async () => {
    mockValidateSession.mockResolvedValue(true)
    const res = mockRes()
    await handler(
      {
        method: 'POST',
        body: { action: 'something-else', provider: 'spotify' },
        headers: { 'user-agent': 'test' },
        query: {},
      },
      res,
    )
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid action' })
  })
})

// ---------------------------------------------------------------------------
describe('OAuth handler: service unavailable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.KV_REST_API_URL
    delete process.env.KV_REST_API_TOKEN
  })

  it('returns 503 when KV is not configured', async () => {
    const res = mockRes()
    await handler({ method: 'GET', query: { action: 'status' }, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(503)
  })
})

// ---------------------------------------------------------------------------
describe('OAuth handler: method not allowed', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.KV_REST_API_URL = 'https://fake-kv.vercel.test'
    process.env.KV_REST_API_TOKEN = 'fake-token'
  })

  it('returns 405 for unsupported method', async () => {
    const res = mockRes()
    await handler({ method: 'PUT', query: {}, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' })
  })

  it('returns 200 for OPTIONS preflight', async () => {
    const res = mockRes()
    await handler({ method: 'OPTIONS', query: {}, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.end).toHaveBeenCalled()
  })
})
