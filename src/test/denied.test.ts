import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest'

// ---------------------------------------------------------------------------
// Mock @vercel/kv
// ---------------------------------------------------------------------------
const mockKvGet = vi.fn()
const mockKvLpush = vi.fn()
const mockKvLtrim = vi.fn()
const mockKvSet = vi.fn()

vi.mock('@vercel/kv', () => ({
  kv: { get: mockKvGet, lpush: mockKvLpush, ltrim: mockKvLtrim, set: mockKvSet },
}))

vi.mock('../../api/_ratelimit.ts', () => ({
  getClientIp: vi.fn().mockReturnValue('1.2.3.4'),
  hashIp: vi.fn().mockReturnValue('hashed-ip-denied'),
  getVercelGeoData: vi.fn().mockReturnValue({ countryCode: null, region: null, city: null, lat: null, lon: null }),
}))

vi.mock('../../api/_honeytokens.js', () => ({
  markAttacker: vi.fn().mockResolvedValue(undefined),
  injectEntropyHeaders: vi.fn(),
  setDefenseHeaders: vi.fn(),
}))

vi.mock('../../api/_threat-score.js', () => ({
  incrementThreatScore: vi.fn().mockResolvedValue({ score: 3, level: 'WARN' }),
  THREAT_REASONS: { ROBOTS_VIOLATION: { reason: 'robots_violation', points: 3 } },
}))

vi.mock('../../api/_blocklist.js', () => ({
  isHardBlocked: vi.fn().mockResolvedValue(false),
}))

vi.mock('../../api/_attacker-profile.js', () => ({
  recordIncident: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../api/_log-poisoning.js', () => ({
  applyLogPoisoning: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../api/_sql-backfire.js', () => ({
  detectSqlInjection: vi.fn().mockReturnValue(false),
  handleSqlInjectionBackfire: vi.fn().mockResolvedValue(false),
}))

vi.mock('../../api/_canary-documents.js', () => ({
  serveCanaryDocument: vi.fn().mockResolvedValue(false),
  generateCanaryToken: vi.fn().mockResolvedValue('aabbccdd1122334455667788aabbccdd'),
}))

vi.mock('../../api/_zipbomb.js', () => ({
  serveZipBomb: vi.fn().mockResolvedValue(undefined),
}))

type Res = {
  status: Mock<(code: number) => Res>
  send: Mock<(data: unknown) => Res>
  setHeader: Mock<(key: string, value: string) => Res>
  json: Mock<(data: unknown) => Res>
  end: Mock<() => Res>
}

function mockRes(): Res {
  const res: Res = {
    status: vi.fn(),
    send: vi.fn(),
    setHeader: vi.fn(),
    json: vi.fn(),
    end: vi.fn(),
  }
  res.status.mockReturnValue(res)
  res.send.mockReturnValue(res)
  res.json.mockReturnValue(res)
  res.end.mockReturnValue(res)
  return res
}

const { default: deniedHandler } = await import('../../api/denied.js')

async function runHandler(req: Parameters<typeof deniedHandler>[0], res: Res) {
  vi.useFakeTimers()
  const promise = deniedHandler(req, res)
  await vi.advanceTimersByTimeAsync(10000)
  const result = await promise
  vi.useRealTimers()
  return result
}

// ---------------------------------------------------------------------------
describe('Denied handler: hard-blocked IPs', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns immediate 403 for hard-blocked IP without tarpit delay', async () => {
    const blocklistMod = await import('../../api/_blocklist.js')
    vi.mocked(blocklistMod.isHardBlocked).mockResolvedValueOnce(true)
    const res = mockRes()
    // Do NOT advance timers — should resolve immediately
    const promise = deniedHandler({ method: 'GET', query: {}, headers: {}, url: '/test' }, res)
    await promise
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({ error: 'FORBIDDEN' })
  })
})

// ---------------------------------------------------------------------------
describe('Denied handler: under attack mode', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 429 with Connection: close when underAttackMode is true', async () => {
    mockKvGet.mockResolvedValue({ underAttackMode: true })
    const res = mockRes()
    await deniedHandler({ method: 'GET', query: {}, headers: {}, url: '/test' }, res)
    expect(res.status).toHaveBeenCalledWith(429)
    expect(res.setHeader).toHaveBeenCalledWith('Connection', 'close')
    expect(res.end).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
describe('Denied handler: zip bomb delivery', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.useRealTimers())

  it('calls serveZipBomb when zipBombEnabled and zipBombOnRobotsViolation are true', async () => {
    mockKvGet.mockResolvedValue({ zipBombEnabled: true, zipBombOnRobotsViolation: true })
    const zipbombMod = await import('../../api/_zipbomb.js')
    const spy = vi.mocked(zipbombMod.serveZipBomb)
    spy.mockResolvedValue(undefined)
    const res = mockRes()
    await runHandler({ method: 'GET', query: { _src: '/admin/' }, headers: {}, url: '/api/denied' }, res)
    expect(spy).toHaveBeenCalledWith(res)
  })

  it('does NOT call serveZipBomb when only zipBombEnabled is true but zipBombOnRobotsViolation is false', async () => {
    mockKvGet.mockResolvedValue({ zipBombEnabled: true, zipBombOnRobotsViolation: false })
    const zipbombMod = await import('../../api/_zipbomb.js')
    const spy = vi.mocked(zipbombMod.serveZipBomb)
    spy.mockClear()
    const res = mockRes()
    await runHandler({ method: 'GET', query: {}, headers: {}, url: '/api/denied' }, res)
    expect(spy).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
describe('Denied handler: canary token in 403 HTML', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.useRealTimers())

  it('embeds canary token in 403 HTML when canaryDocumentsEnabled is true', async () => {
    mockKvGet.mockResolvedValue({ canaryDocumentsEnabled: true })
    const canaryMod = await import('../../api/_canary-documents.js')
    vi.mocked(canaryMod.generateCanaryToken).mockResolvedValue('aabbccdd1122334455667788aabbccdd')
    const res = mockRes()
    await runHandler({ method: 'GET', query: { _src: '/private/' }, headers: {}, url: '/api/denied' }, res)
    const html = res.send.mock.calls[0][0] as string
    expect(html).toContain('aabbccdd1122334455667788aabbccdd')
  })

  it('does NOT embed canary token when canaryDocumentsEnabled is false', async () => {
    mockKvGet.mockResolvedValue({ canaryDocumentsEnabled: false })
    const res = mockRes()
    await runHandler({ method: 'GET', query: { _src: '/private/' }, headers: {}, url: '/api/denied' }, res)
    const html = res.send.mock.calls[0][0] as string
    expect(html).not.toContain('aabbccdd1122334455667788aabbccdd')
  })
})

// ---------------------------------------------------------------------------
describe('Denied handler: SQL injection backfire', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.useRealTimers())

  it('calls handleSqlInjectionBackfire when SQL injection is detected', async () => {
    const sqlMod = await import('../../api/_sql-backfire.js')
    vi.mocked(sqlMod.detectSqlInjection).mockReturnValueOnce(true)
    vi.mocked(sqlMod.handleSqlInjectionBackfire).mockResolvedValueOnce(true)
    mockKvGet.mockResolvedValue(null)
    const res = mockRes()
    await deniedHandler(
      { method: 'GET', query: { key: "' OR 1=1--" }, headers: {}, url: "/api/denied?key='+OR+1=1--" },
      res,
    )
    expect(sqlMod.detectSqlInjection).toHaveBeenCalled()
    expect(sqlMod.handleSqlInjectionBackfire).toHaveBeenCalled()
  })
})
