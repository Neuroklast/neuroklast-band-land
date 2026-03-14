import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'

// ---------------------------------------------------------------------------
// Mock @vercel/kv
// ---------------------------------------------------------------------------
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

vi.mock('../../api/_ratelimit.ts', () => ({
  applyRateLimit: vi.fn().mockResolvedValue(true),
  getClientIp: vi.fn().mockReturnValue('1.2.3.4'),
  hashIp: vi.fn().mockReturnValue('aabbccdd'),
  getVercelGeoData: vi.fn().mockReturnValue({ countryCode: 'DE', region: null, city: null, lat: null, lon: null }),
}))

vi.mock('../../api/_threat-score.ts', () => ({
  incrementThreatScore: vi.fn().mockResolvedValue({ score: 5, level: 'WARN' }),
  THREAT_REASONS: { ROBOTS_VIOLATION: { reason: 'robots', points: 3 } },
}))

vi.mock('../../api/_attacker-profile.ts', () => ({
  recordIncident: vi.fn().mockResolvedValue(undefined),
  addForensicData: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../api/_alerting.ts', () => ({
  sendSecurityAlert: vi.fn().mockResolvedValue(undefined),
}))

type Res = {
  status: Mock<(code: number) => Res>
  json: Mock<(data: unknown) => Res>
  end: Mock<() => Res>
  setHeader: Mock<(key: string, value: string | number) => Res>
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

const {
  generateCanaryToken,
  generateCanaryHtml,
  handleCanaryCallback,
  serveCanaryDocument,
} = await import('../../api/_canary-documents.ts')

// ---------------------------------------------------------------------------
describe('Canary Documents: generateCanaryToken', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockKvSet.mockResolvedValue('OK')
  })

  it('stores token metadata in KV', async () => {
    const req = { method: 'GET', headers: {}, url: '/admin/backup/db-export.html' }
    await generateCanaryToken(req)
    expect(mockKvSet).toHaveBeenCalledWith(
      expect.stringMatching(/^nk-canary:/),
      expect.objectContaining({
        opened: false,
        documentPath: '/admin/backup/db-export.html',
      }),
      expect.objectContaining({ ex: expect.any(Number) }),
    )
  })

  it('returns a 32-character hex token', async () => {
    const req = { method: 'GET', headers: {} }
    const token = await generateCanaryToken(req)
    expect(token).toMatch(/^[a-f0-9]{32}$/)
  })
})

// ---------------------------------------------------------------------------
describe('Canary Documents: generateCanaryHtml', () => {
  it('contains the document name', () => {
    const html = generateCanaryHtml('aabbcc', 'db-export.html')
    expect(html).toContain('db-export.html')
  })

  it('includes tracking pixel when canaryPhoneHomeOnOpen is true', () => {
    const html = generateCanaryHtml('aabbcc', 'test', { canaryPhoneHomeOnOpen: true, canaryDocumentsEnabled: true })
    expect(html).toContain('<img src=')
    expect(html).toContain('e=img')
  })

  it('includes tracking pixel by default (missing settings)', () => {
    const html = generateCanaryHtml('aabbcc', 'test')
    expect(html).toContain('<img src=')
    expect(html).toContain('e=img')
  })

  it('omits tracking pixel when canaryPhoneHomeOnOpen is false', () => {
    const html = generateCanaryHtml('aabbcc', 'test', { canaryPhoneHomeOnOpen: false, canaryDocumentsEnabled: true })
    expect(html).not.toContain('e=img')
  })

  it('includes fingerprint script when canaryCollectFingerprint is true', () => {
    const html = generateCanaryHtml('aabbcc', 'test', { canaryCollectFingerprint: true, canaryDocumentsEnabled: true })
    // CSP-safe external script (no inline <script>) — fingerprinting code is in canary-script endpoint
    expect(html).toContain('<script src="/api/canary-script?t=aabbcc">')
  })

  it('includes fingerprint script by default (missing settings)', () => {
    const html = generateCanaryHtml('aabbcc', 'test')
    expect(html).toContain('<script src=')
  })

  it('omits fingerprint script when canaryCollectFingerprint is false', () => {
    const html = generateCanaryHtml('aabbcc', 'test', { canaryCollectFingerprint: false, canaryDocumentsEnabled: true })
    expect(html).not.toContain('navigator.language')
  })

  it('contains the token in the document body', () => {
    const token = 'deadbeef12345678deadbeef12345678'
    const html = generateCanaryHtml(token, 'api-keys.html')
    expect(html).toContain(token)
  })
})

// ---------------------------------------------------------------------------
describe('Canary Documents: handleCanaryCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockKvGet.mockResolvedValue(null)
    mockKvSet.mockResolvedValue('OK')
    mockKvLpush.mockResolvedValue(1)
    mockKvLtrim.mockResolvedValue('OK')
  })

  it('returns 404 for missing token', async () => {
    const req = { method: 'GET', headers: {}, query: {} }
    const res = mockRes()
    await handleCanaryCallback(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('returns 404 for invalid token format (not 32 hex chars)', async () => {
    const req = { method: 'GET', headers: {}, query: { t: 'tooshort' } }
    const res = mockRes()
    await handleCanaryCallback(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('returns 404 for token with uppercase (not valid hex)', async () => {
    const req = { method: 'GET', headers: {}, query: { t: 'AABBCCDD'.repeat(4) } }
    const res = mockRes()
    await handleCanaryCallback(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('handles GET ?e=img callback and returns 1×1 PNG', async () => {
    const req = {
      method: 'GET',
      headers: {},
      query: { t: 'aabbccdd1122334455667788aabbccdd', e: 'img' },
    }
    const res = mockRes()
    await handleCanaryCallback(req, res)
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png')
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('handles POST ?e=js callback with fingerprint data and returns 204', async () => {
    const req = {
      method: 'POST',
      headers: { 'user-agent': 'TestBot/1.0' },
      query: { t: 'aabbccdd1122334455667788aabbccdd', e: 'js' },
      body: {
        tz: 'Europe/Berlin',
        lang: 'de-DE',
        plat: 'Linux x86_64',
        cores: 4,
        mem: 8,
        sw: 1920,
        sh: 1080,
        cd: 24,
        touch: false,
        cvs: 'abc123',
      },
    }
    const res = mockRes()
    await handleCanaryCallback(req, res)
    expect(res.status).toHaveBeenCalledWith(204)
  })

  it('persists fingerprint to KV (lpush to nk-canary-alerts)', async () => {
    const req = {
      method: 'GET',
      headers: {},
      query: { t: 'aabbccdd1122334455667788aabbccdd', e: 'unknown' },
    }
    const res = mockRes()
    await handleCanaryCallback(req, res)
    expect(mockKvLpush).toHaveBeenCalledWith('nk-canary-alerts', expect.any(String))
  })

  it('calls sendSecurityAlert when alertingEnabled and canaryAlertOnCallback not false', async () => {
    mockKvGet.mockResolvedValue({ alertingEnabled: true })
    const alertMod = await import('../../api/_alerting.ts')
    const spy = vi.mocked(alertMod.sendSecurityAlert)
    spy.mockResolvedValue(undefined)

    const req = {
      method: 'GET',
      headers: {},
      query: { t: 'aabbccdd1122334455667788aabbccdd', e: 'img' },
    }
    const res = mockRes()
    await handleCanaryCallback(req, res)
    expect(spy).toHaveBeenCalled()
  })

  it('does NOT call sendSecurityAlert when canaryAlertOnCallback is false', async () => {
    mockKvGet.mockResolvedValue({ alertingEnabled: true, canaryAlertOnCallback: false })
    const alertMod = await import('../../api/_alerting.ts')
    const spy = vi.mocked(alertMod.sendSecurityAlert)
    spy.mockClear()

    const req = {
      method: 'GET',
      headers: {},
      query: { t: 'aabbccdd1122334455667788aabbccdd', e: 'img' },
    }
    const res = mockRes()
    await handleCanaryCallback(req, res)
    expect(spy).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
describe('Canary Documents: serveCanaryDocument', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockKvGet.mockResolvedValue(null)
    mockKvSet.mockResolvedValue('OK')
  })

  it('returns false when canaryDocumentsEnabled is false', async () => {
    mockKvGet.mockResolvedValue({ canaryDocumentsEnabled: false })
    const req = { method: 'GET', headers: {}, url: '/admin/backup/db-export.html', query: {} }
    const res = mockRes()
    const result = await serveCanaryDocument(req, res)
    expect(result).toBe(false)
    expect(res.status).not.toHaveBeenCalled()
  })

  it('returns false when settings is null (default disabled)', async () => {
    mockKvGet.mockResolvedValue(null)
    const req = { method: 'GET', headers: {}, url: '/admin/backup/db-export.html', query: {} }
    const res = mockRes()
    const result = await serveCanaryDocument(req, res)
    expect(result).toBe(false)
  })

  it('returns false when path does not match any canary document', async () => {
    mockKvGet.mockResolvedValue({ canaryDocumentsEnabled: true })
    const req = { method: 'GET', headers: {}, url: '/not/a/canary/path', query: {} }
    const res = mockRes()
    const result = await serveCanaryDocument(req, res)
    expect(result).toBe(false)
  })

  it('returns true and serves HTML when path matches and canaryDocumentsEnabled is true', async () => {
    mockKvGet.mockResolvedValue({ canaryDocumentsEnabled: true })
    const req = {
      method: 'GET',
      headers: {},
      url: '/admin/backup/db-export.html',
      query: {},
    }
    const res = mockRes()
    const result = await serveCanaryDocument(req, res)
    expect(result).toBe(true)
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html')
    expect(res.status).toHaveBeenCalledWith(200)
  })
})
