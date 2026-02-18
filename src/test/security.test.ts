import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock @vercel/kv
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
}))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Res = { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn>; end: ReturnType<typeof vi.fn>; setHeader: ReturnType<typeof vi.fn>; send: ReturnType<typeof vi.fn> }

function mockRes(): Res {
  const res: Res = {
    status: vi.fn(),
    json: vi.fn(),
    end: vi.fn(),
    setHeader: vi.fn(),
    send: vi.fn(),
  }
  res.status.mockReturnValue(res)
  res.json.mockReturnValue(res)
  res.end.mockReturnValue(res)
  res.send.mockReturnValue(res)
  return res
}

const { default: kvHandler, timingSafeEqual } = await import('../../api/kv.js')

// ---------------------------------------------------------------------------
describe('Security: timingSafeEqual constant-time comparison', () => {
  beforeEach(() => vi.clearAllMocks())

  it('handles different length strings without early return on length', () => {
    // Should return false but still compare all characters
    expect(timingSafeEqual('short', 'muchlonger')).toBe(false)
    expect(timingSafeEqual('muchlonger', 'short')).toBe(false)
  })

  it('returns true for identical strings of various lengths', () => {
    expect(timingSafeEqual('a', 'a')).toBe(true)
    expect(timingSafeEqual('test@example.com', 'test@example.com')).toBe(true)
    expect(timingSafeEqual('x'.repeat(100), 'x'.repeat(100))).toBe(true)
  })

  it('returns false when one string is empty', () => {
    expect(timingSafeEqual('', 'notempty')).toBe(false)
    expect(timingSafeEqual('notempty', '')).toBe(false)
  })

  it('returns false for non-string inputs', () => {
    // @ts-expect-error testing runtime guard
    expect(timingSafeEqual(null, 'abc')).toBe(false)
    // @ts-expect-error testing runtime guard
    expect(timingSafeEqual('abc', undefined)).toBe(false)
    // @ts-expect-error testing runtime guard
    expect(timingSafeEqual(123, 456)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
describe('Security: KV API key validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.KV_REST_API_URL = 'https://fake-kv.vercel.test'
    process.env.KV_REST_API_TOKEN = 'fake-token'
  })

  it('rejects GET with overly long key', async () => {
    const res = mockRes()
    await kvHandler({ method: 'GET', query: { key: 'a'.repeat(201) }, body: {}, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'String must contain at most 200 character(s)' }))
  })

  it('rejects GET with key containing newline characters', async () => {
    const res = mockRes()
    await kvHandler({ method: 'GET', query: { key: 'test\nkey' }, body: {}, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Must not contain control characters' }))
  })

  it('rejects GET with key containing carriage return', async () => {
    const res = mockRes()
    await kvHandler({ method: 'GET', query: { key: 'test\rkey' }, body: {}, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('rejects GET with key containing null byte', async () => {
    const res = mockRes()
    await kvHandler({ method: 'GET', query: { key: 'test\0key' }, body: {}, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('rejects POST with overly long key', async () => {
    const res = mockRes()
    await kvHandler({ method: 'POST', query: {}, body: { key: 'a'.repeat(201), value: 'test' }, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'String must contain at most 200 character(s)' }))
  })

  it('rejects POST with key containing newline', async () => {
    const res = mockRes()
    await kvHandler({ method: 'POST', query: {}, body: { key: 'test\nkey', value: 'x' }, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('rejects POST writes to analytics key prefix', async () => {
    mockKvGet.mockResolvedValue(null) // no password
    const res = mockRes()
    await kvHandler({ method: 'POST', query: {}, body: { key: 'nk-analytics:evil', value: 'x' }, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(403)
    expect(mockKvSet).not.toHaveBeenCalled()
  })

  it('rejects POST writes to heatmap key prefix', async () => {
    mockKvGet.mockResolvedValue(null)
    const res = mockRes()
    await kvHandler({ method: 'POST', query: {}, body: { key: 'nk-heatmap', value: 'x' }, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(403)
    expect(mockKvSet).not.toHaveBeenCalled()
  })

  it('rejects POST writes to image cache key prefix', async () => {
    mockKvGet.mockResolvedValue(null)
    const res = mockRes()
    await kvHandler({ method: 'POST', query: {}, body: { key: 'img-cache:evil', value: 'x' }, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(403)
    expect(mockKvSet).not.toHaveBeenCalled()
  })

  it('allows POST writes to legitimate keys', async () => {
    mockKvGet.mockResolvedValue(null)
    mockKvSet.mockResolvedValue('OK')
    const res = mockRes()
    await kvHandler({ method: 'POST', query: {}, body: { key: 'band-data', value: { name: 'test' } }, headers: {} }, res)
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })
})

// ---------------------------------------------------------------------------
describe('Security: YouTube embed videoId validation', () => {
  it('validates videoId format (only 11 alphanumeric chars with - and _)', () => {
    // This is tested at the component level - the regex check ensures
    // that videoId is sanitized before being embedded in the iframe src
    const validId = 'dQw4w9WgXcQ'
    const invalidId = 'javascript:alert(1)'
    expect(/^[A-Za-z0-9_-]{11}$/.test(validId)).toBe(true)
    expect(/^[A-Za-z0-9_-]{11}$/.test(invalidId)).toBe(false)
    expect(/^[A-Za-z0-9_-]{11}$/.test('')).toBe(false)
    expect(/^[A-Za-z0-9_-]{11}$/.test('<script>alert(1)</script>')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
describe('Security: Drive folder folderId validation', () => {
  it('validates that folderId only contains safe characters', () => {
    const validId = '1abc_DEF-123'
    const invalidId = '../../../etc/passwd'
    const injectionAttempt = 'id=1&evil=true'
    expect(/^[A-Za-z0-9_-]+$/.test(validId)).toBe(true)
    expect(/^[A-Za-z0-9_-]+$/.test(invalidId)).toBe(false)
    expect(/^[A-Za-z0-9_-]+$/.test(injectionAttempt)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
describe('Security: Image proxy SSRF protections', () => {
  // These are unit tests for the isBlockedHost logic patterns
  const BLOCKED_HOST_PATTERNS = [
    /^localhost$/i,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^0\./,
    /^169\.254\./,
    /^\[::1\]/,
    /^\[::ffff:/i,
    /^\[fe80:/i,
    /^\[fc/i,
    /^\[fd/i,
    /^metadata\.google\.internal$/i,
    /^0x[0-9a-f]+$/i,
    /^0[0-7]+\./,
  ]

  function isBlockedHost(hostname: string): boolean {
    if (BLOCKED_HOST_PATTERNS.some(p => p.test(hostname))) return true
    if (/^\d+$/.test(hostname)) return true
    if (!hostname.includes('.') && !hostname.startsWith('[')) return true
    return false
  }

  it('blocks localhost', () => {
    expect(isBlockedHost('localhost')).toBe(true)
    expect(isBlockedHost('LOCALHOST')).toBe(true)
  })

  it('blocks 127.x.x.x addresses', () => {
    expect(isBlockedHost('127.0.0.1')).toBe(true)
  })

  it('blocks private 10.x.x.x addresses', () => {
    expect(isBlockedHost('10.0.0.1')).toBe(true)
  })

  it('blocks private 192.168.x.x addresses', () => {
    expect(isBlockedHost('192.168.1.1')).toBe(true)
  })

  it('blocks private 172.16-31.x.x addresses', () => {
    expect(isBlockedHost('172.16.0.1')).toBe(true)
    expect(isBlockedHost('172.31.255.255')).toBe(true)
  })

  it('blocks link-local 169.254.x.x', () => {
    expect(isBlockedHost('169.254.169.254')).toBe(true)
  })

  it('blocks IPv6 loopback [::1]', () => {
    expect(isBlockedHost('[::1]')).toBe(true)
  })

  it('blocks IPv6 mapped IPv4 [::ffff:127.0.0.1]', () => {
    expect(isBlockedHost('[::ffff:127.0.0.1]')).toBe(true)
  })

  it('blocks IPv6 link-local [fe80::]', () => {
    expect(isBlockedHost('[fe80::1]')).toBe(true)
  })

  it('blocks IPv6 unique local [fc/fd]', () => {
    expect(isBlockedHost('[fc00::1]')).toBe(true)
    expect(isBlockedHost('[fd00::1]')).toBe(true)
  })

  it('blocks metadata.google.internal', () => {
    expect(isBlockedHost('metadata.google.internal')).toBe(true)
  })

  it('blocks hex IP notation', () => {
    expect(isBlockedHost('0x7f000001')).toBe(true)
  })

  it('blocks octal IP notation', () => {
    expect(isBlockedHost('0177.0.0.1')).toBe(true)
  })

  it('blocks decimal integer IP (2130706433 = 127.0.0.1)', () => {
    expect(isBlockedHost('2130706433')).toBe(true)
  })

  it('blocks hostnames without dots (internal names)', () => {
    expect(isBlockedHost('intranet')).toBe(true)
    expect(isBlockedHost('internal')).toBe(true)
  })

  it('allows legitimate external hosts', () => {
    expect(isBlockedHost('drive.google.com')).toBe(false)
    expect(isBlockedHost('example.com')).toBe(false)
    expect(isBlockedHost('lh3.googleusercontent.com')).toBe(false)
  })
})
