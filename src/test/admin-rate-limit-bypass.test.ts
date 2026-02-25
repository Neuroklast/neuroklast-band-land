import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock @vercel/kv
// ---------------------------------------------------------------------------
const mockKvGet = vi.fn()
const mockKvSet = vi.fn()
const mockKvLrange = vi.fn()
const mockKvDel = vi.fn()
const mockKvLpush = vi.fn()
const mockKvLtrim = vi.fn()

vi.mock('@vercel/kv', () => ({
  kv: {
    get: mockKvGet,
    set: mockKvSet,
    lrange: mockKvLrange,
    del: mockKvDel,
    lpush: mockKvLpush,
    ltrim: mockKvLtrim,
  },
}))

// Mock rate limiter — track calls to verify bypass behavior
const mockApplyRateLimit = vi.fn().mockResolvedValue(true)
vi.mock('../../api/_ratelimit.js', () => ({
  applyRateLimit: mockApplyRateLimit,
  getClientIp: vi.fn().mockReturnValue('192.168.1.100'),
  hashIp: vi.fn().mockReturnValue('abc123hashedip'),
}))

// Mock auth — controllable session validation
const mockValidateSession = vi.fn()
vi.mock('../../api/auth.js', () => ({
  validateSession: mockValidateSession,
}))

// Mock attacker profile
vi.mock('../../api/_attacker-profile.js', () => ({
  recordIncident: vi.fn().mockResolvedValue(undefined),
  getProfile: vi.fn().mockResolvedValue(null),
  getAllProfiles: vi.fn().mockResolvedValue({ profiles: [], total: 0 }),
  deleteProfile: vi.fn().mockResolvedValue(true),
  analyzeUserAgents: vi.fn().mockReturnValue({}),
}))

// Mock blocklist
vi.mock('../../api/_blocklist.js', () => ({
  blockIp: vi.fn().mockResolvedValue(undefined),
  unblockIp: vi.fn().mockResolvedValue(undefined),
  getAllBlockedIps: vi.fn().mockResolvedValue([]),
}))

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

// ---------------------------------------------------------------------------
// Import handlers
// ---------------------------------------------------------------------------
const securityIncidentsHandler = (await import('../../api/security-incidents.js')).default
const securitySettingsHandler = (await import('../../api/security-settings.js')).default
const blocklistHandler = (await import('../../api/blocklist.js')).default
const canaryAlertsHandler = (await import('../../api/canary-alerts.js')).default
const attackerProfileHandler = (await import('../../api/attacker-profile.js')).default

// ---------------------------------------------------------------------------
// Rate Limit Bypass for Authenticated Admin Sessions
// ---------------------------------------------------------------------------
describe('Admin rate limit bypass: security-incidents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.KV_REST_API_URL = 'http://localhost'
    process.env.KV_REST_API_TOKEN = 'test-token'
  })

  it('skips rate limiting when session is valid', async () => {
    mockValidateSession.mockResolvedValue(true)
    mockKvLrange.mockResolvedValue([])
    const res = mockRes()
    await securityIncidentsHandler({ method: 'GET', headers: {} }, res)
    expect(mockApplyRateLimit).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({ incidents: [] })
  })

  it('applies rate limiting when session is invalid', async () => {
    mockValidateSession.mockResolvedValue(false)
    mockApplyRateLimit.mockResolvedValue(true)
    const res = mockRes()
    await securityIncidentsHandler({ method: 'GET', headers: {} }, res)
    expect(mockApplyRateLimit).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('returns 429 when unauthenticated and rate limited', async () => {
    mockValidateSession.mockResolvedValue(false)
    mockApplyRateLimit.mockResolvedValue(false)
    const res = mockRes()
    await securityIncidentsHandler({ method: 'GET', headers: {} }, res)
    expect(mockApplyRateLimit).toHaveBeenCalled()
    // When rate limit returns false, the handler returns early (429 already sent by applyRateLimit)
    expect(res.status).not.toHaveBeenCalledWith(403)
  })
})

describe('Admin rate limit bypass: security-settings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.KV_REST_API_URL = 'http://localhost'
    process.env.KV_REST_API_TOKEN = 'test-token'
  })

  it('skips rate limiting when session is valid', async () => {
    mockValidateSession.mockResolvedValue(true)
    mockKvGet.mockResolvedValue({})
    const res = mockRes()
    await securitySettingsHandler({ method: 'GET', headers: {} }, res)
    expect(mockApplyRateLimit).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ settings: expect.any(Object) }))
  })

  it('applies rate limiting when session is invalid', async () => {
    mockValidateSession.mockResolvedValue(false)
    mockApplyRateLimit.mockResolvedValue(true)
    const res = mockRes()
    await securitySettingsHandler({ method: 'GET', headers: {} }, res)
    expect(mockApplyRateLimit).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
  })
})

describe('Admin rate limit bypass: blocklist', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.KV_REST_API_URL = 'http://localhost'
    process.env.KV_REST_API_TOKEN = 'test-token'
  })

  it('skips rate limiting when session is valid', async () => {
    mockValidateSession.mockResolvedValue(true)
    const res = mockRes()
    await blocklistHandler({ method: 'GET', headers: {} }, res)
    expect(mockApplyRateLimit).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ blocked: expect.any(Array) }))
  })

  it('applies rate limiting when session is invalid', async () => {
    mockValidateSession.mockResolvedValue(false)
    mockApplyRateLimit.mockResolvedValue(true)
    const res = mockRes()
    await blocklistHandler({ method: 'GET', headers: {} }, res)
    expect(mockApplyRateLimit).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
  })
})

describe('Admin rate limit bypass: canary-alerts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.KV_REST_API_URL = 'http://localhost'
    process.env.KV_REST_API_TOKEN = 'test-token'
  })

  it('skips rate limiting when session is valid', async () => {
    mockValidateSession.mockResolvedValue(true)
    mockKvLrange.mockResolvedValue([])
    const res = mockRes()
    await canaryAlertsHandler({ method: 'GET', headers: {} }, res)
    expect(mockApplyRateLimit).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({ alerts: [] })
  })

  it('applies rate limiting when session is invalid', async () => {
    mockValidateSession.mockResolvedValue(false)
    mockApplyRateLimit.mockResolvedValue(true)
    const res = mockRes()
    await canaryAlertsHandler({ method: 'GET', headers: {} }, res)
    expect(mockApplyRateLimit).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
  })
})

describe('Admin rate limit bypass: attacker-profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.KV_REST_API_URL = 'http://localhost'
    process.env.KV_REST_API_TOKEN = 'test-token'
  })

  it('skips rate limiting when session is valid', async () => {
    mockValidateSession.mockResolvedValue(true)
    const res = mockRes()
    await attackerProfileHandler({ method: 'GET', headers: {}, query: { limit: '10', offset: '0' } }, res)
    expect(mockApplyRateLimit).not.toHaveBeenCalled()
  })

  it('applies rate limiting when session is invalid', async () => {
    mockValidateSession.mockResolvedValue(false)
    mockApplyRateLimit.mockResolvedValue(true)
    const res = mockRes()
    await attackerProfileHandler({ method: 'GET', headers: {}, query: {} }, res)
    expect(mockApplyRateLimit).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
  })
})

// ---------------------------------------------------------------------------
// New Settings Defaults
// ---------------------------------------------------------------------------
describe('New countermeasure rule defaults', () => {
  it('DEFAULT_SETTINGS includes new tarpit trigger rules', async () => {
    const { DEFAULT_SETTINGS } = await import('../../src/components/SecuritySettingsDialog')
    expect(DEFAULT_SETTINGS).toHaveProperty('tarpitOnHoneytoken', false)
    expect(DEFAULT_SETTINGS).toHaveProperty('tarpitOnBlock', false)
  })

  it('DEFAULT_SETTINGS includes new zip bomb trigger rules', async () => {
    const { DEFAULT_SETTINGS } = await import('../../src/components/SecuritySettingsDialog')
    expect(DEFAULT_SETTINGS).toHaveProperty('zipBombOnRobotsViolation', false)
    expect(DEFAULT_SETTINGS).toHaveProperty('zipBombOnSuspiciousUa', false)
    expect(DEFAULT_SETTINGS).toHaveProperty('zipBombOnRateLimit', false)
  })

  it('all new settings are JSON-serializable', async () => {
    const { DEFAULT_SETTINGS } = await import('../../src/components/SecuritySettingsDialog')
    const json = JSON.stringify(DEFAULT_SETTINGS)
    const parsed = JSON.parse(json)
    expect(parsed.tarpitOnHoneytoken).toBe(false)
    expect(parsed.tarpitOnBlock).toBe(false)
    expect(parsed.zipBombOnRobotsViolation).toBe(false)
    expect(parsed.zipBombOnSuspiciousUa).toBe(false)
    expect(parsed.zipBombOnRateLimit).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// New i18n Translation Keys
// ---------------------------------------------------------------------------
describe('i18n: new rule trigger translations', () => {
  it('has translations for new tarpit rules', async () => {
    const { t } = await import('../../src/lib/i18n-security')
    expect(t('rules.tarpitOnHoneytoken', 'en')).toBe('Tarpit on honeytoken access')
    expect(t('rules.tarpitOnHoneytoken', 'de')).toBe('Tarpit bei Honeytoken-Zugriff')
    expect(t('rules.tarpitOnBlock', 'en')).toBe('Tarpit on BLOCK level')
    expect(t('rules.tarpitOnBlock', 'de')).toBe('Tarpit bei BLOCK-Stufe')
  })

  it('has translations for new zip bomb rules', async () => {
    const { t } = await import('../../src/lib/i18n-security')
    expect(t('rules.zipBombOnRobotsViolation', 'en')).toBe('Zip bomb on robots.txt violation')
    expect(t('rules.zipBombOnRobotsViolation', 'de')).toBe('Zip-Bombe bei robots.txt-Verstoß')
    expect(t('rules.zipBombOnSuspiciousUa', 'en')).toBe('Zip bomb on suspicious User-Agent')
    expect(t('rules.zipBombOnSuspiciousUa', 'de')).toBe('Zip-Bombe bei verdächtigem User-Agent')
    expect(t('rules.zipBombOnRateLimit', 'en')).toBe('Zip bomb on rate limit exceeded')
    expect(t('rules.zipBombOnRateLimit', 'de')).toBe('Zip-Bombe bei Ratenbegrenzung überschritten')
  })

  it('has translations for rule section headers', async () => {
    const { t } = await import('../../src/lib/i18n-security')
    expect(t('rules.tarpitRulesHeader', 'en')).toBe('TARPIT TRIGGER RULES')
    expect(t('rules.tarpitRulesHeader', 'de')).toBe('TARPIT-AUSLÖSEREGELN')
    expect(t('rules.zipBombRulesHeader', 'en')).toBe('ZIP BOMB TRIGGER RULES')
    expect(t('rules.zipBombRulesHeader', 'de')).toBe('ZIP-BOMBEN-AUSLÖSEREGELN')
  })

  it('has translations for countermeasure result labels', async () => {
    const { t } = await import('../../src/lib/i18n-security')
    expect(t('sec.countermeasureResult', 'en')).toBe('Result:')
    expect(t('sec.countermeasureResult', 'de')).toBe('Ergebnis:')
    expect(t('sec.resultZipBombSent', 'en')).toBe('ZIP BOMB DELIVERED')
  })

  it('has tooltips for new rules', async () => {
    const { tip } = await import('../../src/lib/i18n-security')
    expect(tip('rules.tarpitOnHoneytoken', 'en')).toBeDefined()
    expect(tip('rules.tarpitOnBlock', 'en')).toBeDefined()
    expect(tip('rules.zipBombOnRobotsViolation', 'en')).toBeDefined()
    expect(tip('rules.zipBombOnSuspiciousUa', 'en')).toBeDefined()
    expect(tip('rules.zipBombOnRateLimit', 'en')).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// Incident classification with countermeasure info
// ---------------------------------------------------------------------------
describe('SecurityIncidentsDashboard: classifyCountermeasure', () => {
  it('classifies incidents with explicit countermeasure field', async () => {
    const { classifyCountermeasure } = await import('../../src/components/SecurityIncidentsDashboard')
    expect(classifyCountermeasure({
      key: 'robots:/admin',
      method: 'GET',
      hashedIp: 'abc',
      userAgent: 'bot',
      timestamp: '2026-01-01T00:00:00Z',
      countermeasure: 'ZIP_BOMB',
    })).toBe('ZIP_BOMB')
  })

  it('classifies blocked incidents', async () => {
    const { classifyCountermeasure } = await import('../../src/components/SecurityIncidentsDashboard')
    expect(classifyCountermeasure({
      key: 'robots:/admin',
      method: 'GET',
      hashedIp: 'abc',
      userAgent: 'bot',
      timestamp: '2026-01-01T00:00:00Z',
      threatLevel: 'BLOCK',
    })).toBe('BLOCKED')
  })

  it('classifies tarpitted incidents', async () => {
    const { classifyCountermeasure } = await import('../../src/components/SecurityIncidentsDashboard')
    expect(classifyCountermeasure({
      key: 'robots:/admin',
      method: 'GET',
      hashedIp: 'abc',
      userAgent: 'bot',
      timestamp: '2026-01-01T00:00:00Z',
      threatLevel: 'TARPIT',
    })).toBe('TARPITTED')
  })
})
