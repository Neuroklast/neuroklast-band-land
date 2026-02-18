import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock @vercel/kv — must be declared before importing modules
// ---------------------------------------------------------------------------
const mockKvGet = vi.fn()
const mockKvSet = vi.fn()
const mockKvLpush = vi.fn()
const mockKvLtrim = vi.fn()

vi.mock('@vercel/kv', () => ({
  kv: { get: mockKvGet, set: mockKvSet, lpush: mockKvLpush, ltrim: mockKvLtrim },
}))

// Mock rate limiter
vi.mock('../../api/_ratelimit.js', () => ({
  applyRateLimit: vi.fn().mockResolvedValue(true),
  getClientIp: vi.fn().mockReturnValue('1.2.3.4'),
  hashIp: vi.fn().mockReturnValue('hashed-ip-1234'),
}))

const {
  markAttacker,
  isMarkedAttacker,
  injectEntropyHeaders,
  triggerHoneytokenAlarm,
} = await import('../../api/_honeytokens.js')

// ---------------------------------------------------------------------------
describe('Entropy Injection: markAttacker', () => {
  beforeEach(() => vi.clearAllMocks())

  it('flags an IP hash in KV with 24h TTL', async () => {
    mockKvSet.mockResolvedValue('OK')
    await markAttacker('abc123hash')
    expect(mockKvSet).toHaveBeenCalledWith('nk-flagged:abc123hash', true, { ex: 86400 })
  })

  it('does not throw when KV write fails', async () => {
    mockKvSet.mockRejectedValue(new Error('KV unavailable'))
    await expect(markAttacker('abc123hash')).resolves.not.toThrow()
  })
})

// ---------------------------------------------------------------------------
describe('Entropy Injection: isMarkedAttacker', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns true when the IP hash is flagged in KV', async () => {
    mockKvGet.mockResolvedValue(true)
    const result = await isMarkedAttacker({ headers: {} })
    expect(result).toBe(true)
    expect(mockKvGet).toHaveBeenCalledWith('nk-flagged:hashed-ip-1234')
  })

  it('returns false when the IP hash is not flagged', async () => {
    mockKvGet.mockResolvedValue(null)
    const result = await isMarkedAttacker({ headers: {} })
    expect(result).toBe(false)
  })

  it('returns false when KV read fails', async () => {
    mockKvGet.mockRejectedValue(new Error('KV unavailable'))
    const result = await isMarkedAttacker({ headers: {} })
    expect(result).toBe(false)
  })
})

// ---------------------------------------------------------------------------
describe('Entropy Injection: injectEntropyHeaders', () => {
  it('injects 200 random headers by default', () => {
    const headers: Record<string, string> = {}
    const res = { setHeader: vi.fn((k: string, v: string) => { headers[k] = v }) }
    injectEntropyHeaders(res)
    expect(res.setHeader).toHaveBeenCalledTimes(200)
    // Check naming pattern
    expect(res.setHeader).toHaveBeenCalledWith('X-Neural-Noise-000', expect.any(String))
    expect(res.setHeader).toHaveBeenCalledWith('X-Neural-Noise-199', expect.any(String))
  })

  it('injects configurable number of headers', () => {
    const res = { setHeader: vi.fn() }
    injectEntropyHeaders(res, 10)
    expect(res.setHeader).toHaveBeenCalledTimes(10)
  })

  it('generates hex values of expected length (32 hex chars = 16 bytes)', () => {
    const values: string[] = []
    const res = { setHeader: vi.fn((_k: string, v: string) => { values.push(v) }) }
    injectEntropyHeaders(res, 5)
    for (const val of values) {
      expect(val).toMatch(/^[0-9a-f]{32}$/)
    }
  })

  it('generates unique values across headers', () => {
    const values: string[] = []
    const res = { setHeader: vi.fn((_k: string, v: string) => { values.push(v) }) }
    injectEntropyHeaders(res, 50)
    const unique = new Set(values)
    // Cryptographically random — extremely unlikely to have duplicates
    expect(unique.size).toBe(50)
  })
})

// ---------------------------------------------------------------------------
describe('Entropy Injection: triggerHoneytokenAlarm marks attacker', () => {
  beforeEach(() => vi.clearAllMocks())

  it('marks the IP as an attacker when a honeytoken is triggered', async () => {
    mockKvSet.mockResolvedValue('OK')
    mockKvLpush.mockResolvedValue(1)
    mockKvLtrim.mockResolvedValue('OK')
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await triggerHoneytokenAlarm(
      { method: 'GET', headers: { 'user-agent': 'TestBot' } },
      'admin_backup'
    )

    // Should have called kv.set for the flagged IP
    expect(mockKvSet).toHaveBeenCalledWith('nk-flagged:hashed-ip-1234', true, { ex: 86400 })
    consoleSpy.mockRestore()
  })
})
