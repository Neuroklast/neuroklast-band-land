import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'

// ---------------------------------------------------------------------------
// Dedicated test file for direct _honeytokens unit tests.
// Does NOT mock _honeytokens itself — tests the real implementation.
// ---------------------------------------------------------------------------

// Mock @vercel/kv
const mockKvGet = vi.fn()
const mockKvSet = vi.fn()
const mockKvLpush = vi.fn()
const mockKvLtrim = vi.fn()

vi.mock('@vercel/kv', () => ({
  kv: {
    get: mockKvGet,
    set: mockKvSet,
    lpush: mockKvLpush,
    ltrim: mockKvLtrim,
  },
}))

// Mock ratelimit utilities used by _honeytokens
vi.mock('../../api/_ratelimit.ts', () => ({
  getClientIp: vi.fn().mockReturnValue('1.2.3.4'),
  hashIp: vi.fn().mockReturnValue('deadbeef1234567890'),
  getVercelGeoData: vi.fn().mockReturnValue({ countryCode: 'DE', region: null, city: null, lat: null, lon: null }),
}))

// Mock downstream dependencies to keep tests fast and isolated
vi.mock('../../api/_threat-score.ts', () => ({
  incrementThreatScore: vi.fn().mockResolvedValue({ score: 5, level: 'WARN' }),
  THREAT_REASONS: {
    HONEYTOKEN_ACCESS: { reason: 'honeytoken_access', points: 5 },
  },
}))

vi.mock('../../api/_alerting.ts', () => ({
  sendSecurityAlert: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../api/_attacker-profile.ts', () => ({
  recordIncident: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../api/_zipbomb.ts', () => ({
  serveZipBomb: vi.fn().mockResolvedValue(undefined),
}))

type Res = {
  status: Mock<(code: number) => Res>
  json: Mock<(data: unknown) => Res>
  end: Mock<() => Res>
  setHeader: Mock<(key: string, value: string) => Res>
  send: Mock<(data: unknown) => Res>
}

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

const { isHoneytoken, triggerHoneytokenAlarm } = await import('../../api/_honeytokens.ts')

// ---------------------------------------------------------------------------
describe('Honeytokens: isHoneytoken', () => {
  it('returns true for all known honeytoken keys', () => {
    expect(isHoneytoken('admin_backup')).toBe(true)
    expect(isHoneytoken('admin-backup-hash')).toBe(true)
    expect(isHoneytoken('db-credentials')).toBe(true)
    expect(isHoneytoken('api-master-key')).toBe(true)
    expect(isHoneytoken('backup-admin-password')).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(isHoneytoken('ADMIN_BACKUP')).toBe(true)
    expect(isHoneytoken('Admin_Backup')).toBe(true)
    expect(isHoneytoken('DB-CREDENTIALS')).toBe(true)
  })

  it('returns false for legitimate keys', () => {
    expect(isHoneytoken('band-data')).toBe(false)
    expect(isHoneytoken('site-config')).toBe(false)
    expect(isHoneytoken('nk-security-settings')).toBe(false)
  })

  it('returns false for non-string input (runtime safety)', () => {
    // Cast the function to accept unknown so we can test JS runtime safety
    // without using the banned "as unknown as" pattern.
    const check = isHoneytoken as (v: unknown) => boolean
    expect(check(null)).toBe(false)
    expect(check(undefined)).toBe(false)
    expect(check(42)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
describe('Honeytokens: triggerHoneytokenAlarm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockKvGet.mockResolvedValue(null)
    mockKvLpush.mockResolvedValue(1)
    mockKvLtrim.mockResolvedValue('OK')
    mockKvSet.mockResolvedValue('OK')
  })

  it('persists incident entry to KV via lpush', async () => {
    const req = { method: 'GET', headers: {} }
    await triggerHoneytokenAlarm(req, 'admin_backup', null)
    expect(mockKvLpush).toHaveBeenCalledWith('nk-honeytoken-alerts', expect.any(String))
    const stored = JSON.parse(mockKvLpush.mock.calls[0][1])
    expect(stored.key).toBe('admin_backup')
    expect(stored.hashedIp).toBeDefined()
    expect(stored.incidentClass).toBe('HONEYTOKEN_ACCESS')
    expect(stored.evidenceHash).toBeDefined()
  })

  it('trims the KV list to 500 entries after writing', async () => {
    const req = { method: 'GET', headers: {} }
    await triggerHoneytokenAlarm(req, 'db-credentials', null)
    expect(mockKvLtrim).toHaveBeenCalledWith('nk-honeytoken-alerts', 0, 499)
  })

  it('calls sendSecurityAlert when alertingEnabled is true', async () => {
    mockKvGet.mockResolvedValue({ alertingEnabled: true })
    const alertMod = await import('../../api/_alerting.ts')
    const spy = vi.mocked(alertMod.sendSecurityAlert)
    const req = { method: 'GET', headers: {} }
    await triggerHoneytokenAlarm(req, 'api-master-key', null)
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ type: 'HONEYTOKEN ACCESS' }))
  })

  it('calls serveZipBomb when zipBombEnabled is true and res is provided', async () => {
    mockKvGet.mockResolvedValue({ zipBombEnabled: true })
    const res = mockRes()
    const zipbombMod = await import('../../api/_zipbomb.ts')
    const spy = vi.mocked(zipbombMod.serveZipBomb)
    const req = { method: 'GET', headers: {} }
    await triggerHoneytokenAlarm(req, 'api-master-key', res)
    expect(spy).toHaveBeenCalledWith(res)
  })

  it('does NOT call serveZipBomb when res is null', async () => {
    mockKvGet.mockResolvedValue({ zipBombEnabled: true })
    const zipbombMod = await import('../../api/_zipbomb.ts')
    const spy = vi.mocked(zipbombMod.serveZipBomb)
    spy.mockClear()
    const req = { method: 'GET', headers: {} }
    await triggerHoneytokenAlarm(req, 'admin_backup', null)
    expect(spy).not.toHaveBeenCalled()
  })

  it('stores country code from Vercel geo headers in incident entry', async () => {
    const req = { method: 'GET', headers: { 'x-vercel-ip-country': 'DE' } }
    await triggerHoneytokenAlarm(req, 'backup-admin-password', null)
    const stored = JSON.parse(mockKvLpush.mock.calls[0][1])
    expect(stored.countryCode).toBe('DE')
  })

  it('stores sanitized request headers (no cookie or authorization)', async () => {
    const req = {
      method: 'GET',
      headers: {
        'user-agent': 'TestBot/1.0',
        cookie: 'session=secret',
        authorization: 'Bearer token',
        'x-custom-header': 'visible',
      },
    }
    await triggerHoneytokenAlarm(req, 'admin_backup', null)
    const stored = JSON.parse(mockKvLpush.mock.calls[0][1])
    expect(stored.requestHeaders).toBeDefined()
    expect(stored.requestHeaders['user-agent']).toBe('TestBot/1.0')
    expect(stored.requestHeaders['x-custom-header']).toBe('visible')
    expect(stored.requestHeaders['cookie']).toBeUndefined()
    expect(stored.requestHeaders['authorization']).toBeUndefined()
  })
})
