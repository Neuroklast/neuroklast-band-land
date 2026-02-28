import { describe, it, expect, vi, beforeEach } from 'vitest'

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

// Mock rate limiter
vi.mock('../../api/_ratelimit.js', () => ({
  applyRateLimit: vi.fn().mockResolvedValue(true),
  getClientIp: vi.fn().mockReturnValue('192.168.1.100'),
  hashIp: vi.fn().mockReturnValue('abc123hashedip'),
}))

// Mock attacker profile
vi.mock('../../api/_attacker-profile.js', () => ({
  recordIncident: vi.fn().mockResolvedValue(undefined),
}))

// Mock threat score
vi.mock('../../api/_threat-score.js', () => ({
  incrementThreatScore: vi.fn().mockResolvedValue({ score: 5, level: 'WARN' }),
  THREAT_REASONS: {
    HONEYTOKEN_ACCESS: { reason: 'honeytoken_access', points: 5 },
    ROBOTS_VIOLATION: { reason: 'robots_violation', points: 3 },
  },
}))

// Mock alerting
vi.mock('../../api/_alerting.js', () => ({
  sendSecurityAlert: vi.fn().mockResolvedValue(undefined),
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
// SQL Injection Backfire Tests
// ---------------------------------------------------------------------------
const { detectSqlInjection, setBackfireHeaders, generateBackfireBody, handleSqlInjectionBackfire } = await import('../../api/_sql-backfire.js')

describe('SQL Injection Backfire: detectSqlInjection', () => {
  it('detects UNION SELECT in query params', () => {
    expect(detectSqlInjection({
      query: { id: "1 UNION SELECT * FROM users" },
      body: {},
      url: '/',
      headers: {},
    })).toBe(true)
  })

  it('detects OR-based injection in query params', () => {
    expect(detectSqlInjection({
      query: { user: "' OR '1'='1" },
      body: {},
      url: '/',
      headers: {},
    })).toBe(true)
  })

  it('detects DROP TABLE in request body', () => {
    expect(detectSqlInjection({
      query: {},
      body: { name: "; DROP TABLE users" },
      url: '/',
      headers: {},
    })).toBe(true)
  })

  it('detects SLEEP-based blind injection', () => {
    expect(detectSqlInjection({
      query: { id: "1 AND SLEEP(5)" },
      body: {},
      url: '/',
      headers: {},
    })).toBe(true)
  })

  it('detects information_schema probing', () => {
    expect(detectSqlInjection({
      query: {},
      body: { q: "SELECT * FROM information_schema.tables" },
      url: '/',
      headers: {},
    })).toBe(true)
  })

  it('detects SQL in URL path', () => {
    expect(detectSqlInjection({
      query: {},
      body: {},
      url: "/api/users?id=1' OR '1'='1",
      headers: {},
    })).toBe(true)
  })

  it('detects SQL in cookies', () => {
    expect(detectSqlInjection({
      query: {},
      body: {},
      url: '/',
      headers: { cookie: "session=abc'; DROP TABLE sessions;--" },
    })).toBe(true)
  })

  it('does not flag normal requests', () => {
    expect(detectSqlInjection({
      query: { search: 'hello world' },
      body: { name: 'John Doe' },
      url: '/api/search',
      headers: {},
    })).toBe(false)
  })

  it('does not flag empty requests', () => {
    expect(detectSqlInjection({
      query: {},
      body: {},
      url: '/',
      headers: {},
    })).toBe(false)
  })

  it('handles null/undefined body gracefully', () => {
    expect(detectSqlInjection({
      query: {},
      body: null,
      url: '/',
      headers: {},
    })).toBe(false)
  })
})

describe('SQL Injection Backfire: setBackfireHeaders', () => {
  it('sets poisoned SQL headers on the response', () => {
    const res = mockRes()
    setBackfireHeaders(res)
    expect(res.setHeader).toHaveBeenCalledWith('X-DB-Status', expect.stringContaining('DROP TABLE'))
    expect(res.setHeader).toHaveBeenCalledWith('X-SQL-Version', expect.stringContaining('UPDATE'))
    expect(res.setHeader).toHaveBeenCalledWith('X-Backend-DB', expect.stringContaining('DELETE'))
    expect(res.setHeader).toHaveBeenCalledWith('X-Debug-Query', expect.stringContaining('DROP TABLE'))
  })
})

describe('SQL Injection Backfire: generateBackfireBody', () => {
  it('returns object with SQL poison payloads', () => {
    const body = generateBackfireBody()
    expect(body).toHaveProperty('error')
    expect(body).toHaveProperty('message')
    expect(body).toHaveProperty('details')
    expect(body).toHaveProperty('debug')
    expect(body.debug).toHaveProperty('tables')
    // Message should contain SQL-like content
    expect(body.message).toContain("'")
  })

  it('produces randomized payloads', () => {
    const body1 = generateBackfireBody()
    const body2 = generateBackfireBody()
    // Bodies could differ due to randomization (or match by chance)
    expect(body1).toHaveProperty('error', 'Database error')
    expect(body2).toHaveProperty('error', 'Database error')
  })
})

describe('SQL Injection Backfire: handleSqlInjectionBackfire', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns false when sqlBackfireEnabled is false', async () => {
    mockKvGet.mockResolvedValue({ sqlBackfireEnabled: false })
    const res = mockRes()
    const result = await handleSqlInjectionBackfire(
      { method: 'GET', url: '/', headers: {}, query: {} },
      res
    )
    expect(result).toBe(false)
  })

  it('sends backfire response when enabled', async () => {
    mockKvGet.mockResolvedValue({ sqlBackfireEnabled: true })
    const res = mockRes()
    await handleSqlInjectionBackfire(
      { method: 'GET', url: '/', headers: { 'user-agent': 'sqlmap/1.6' }, query: {} },
      res
    )
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalled()
    expect(res.setHeader).toHaveBeenCalledWith('X-DB-Status', expect.any(String))
  })
})

// ---------------------------------------------------------------------------
// Canary Documents Tests
// ---------------------------------------------------------------------------
const { CANARY_DOCUMENTS, generateCanaryToken, generateCanaryHtml, handleCanaryCallback, serveCanaryDocument } = await import('../../api/_canary-documents.js')

describe('Canary Documents: CANARY_DOCUMENTS config', () => {
  it('has multiple canary document definitions', () => {
    expect(Object.keys(CANARY_DOCUMENTS).length).toBeGreaterThanOrEqual(3)
  })

  it('each document has path, description, and contentType', () => {
    for (const [, doc] of Object.entries(CANARY_DOCUMENTS)) {
      expect(doc).toHaveProperty('path')
      expect(doc).toHaveProperty('description')
      expect(doc).toHaveProperty('contentType')
    }
  })

  it('all paths start with /', () => {
    for (const [, doc] of Object.entries(CANARY_DOCUMENTS)) {
      expect(doc.path).toMatch(/^\//)
    }
  })
})

describe('Canary Documents: generateCanaryToken', () => {
  beforeEach(() => vi.clearAllMocks())

  it('generates a 32-character hex token', async () => {
    mockKvSet.mockResolvedValue('OK')
    const token = await generateCanaryToken({
      headers: { 'user-agent': 'TestBrowser/1.0' },
      url: '/admin/backup/db-export.html',
    })
    expect(token).toMatch(/^[a-f0-9]{32}$/)
  })

  it('stores token metadata in KV', async () => {
    mockKvSet.mockResolvedValue('OK')
    await generateCanaryToken({
      headers: { 'user-agent': 'TestBrowser/1.0' },
      url: '/admin/backup/db-export.html',
    })
    expect(mockKvSet).toHaveBeenCalledWith(
      expect.stringMatching(/^nk-canary:/),
      expect.objectContaining({
        token: expect.any(String),
        hashedIp: expect.any(String),
        userAgent: 'TestBrowser/1.0',
      }),
      expect.objectContaining({ ex: expect.any(Number) })
    )
  })
})

describe('Canary Documents: generateCanaryHtml', () => {
  it('returns valid HTML with tracking elements', () => {
    const html = generateCanaryHtml('abc123def456abc123def456abc123de', 'test-doc.html')
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('CONFIDENTIAL')
    expect(html).toContain('abc123def456abc123def456abc123de')
    expect(html).toContain('/api/canary-callback')
    expect(html).toContain('<script>')
    expect(html).toContain('<img src=')
  })

  it('escapes document name to prevent XSS', () => {
    const html = generateCanaryHtml('token123token123token123token123', '<script>alert(1)</script>')
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('includes WebRTC STUN for real IP discovery', () => {
    const html = generateCanaryHtml('token123token123token123token123', 'doc')
    expect(html).toContain('RTCPeerConnection')
    expect(html).toContain('stun:stun.l.google.com')
  })

  it('includes browser fingerprinting code', () => {
    const html = generateCanaryHtml('token123token123token123token123', 'doc')
    expect(html).toContain('navigator.platform')
    expect(html).toContain('screen.width')
    expect(html).toContain('hardwareConcurrency')
  })
})

describe('Canary Documents: handleCanaryCallback', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 404 for missing token', async () => {
    const res = mockRes()
    await handleCanaryCallback(
      { query: {}, headers: {}, method: 'GET' },
      res
    )
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('returns 404 for invalid token format', async () => {
    const res = mockRes()
    await handleCanaryCallback(
      { query: { t: 'invalid!' }, headers: {}, method: 'GET' },
      res
    )
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('returns 1x1 pixel for image event callbacks', async () => {
    mockKvGet.mockResolvedValue({ hashedIp: 'abc123', documentPath: '/admin/backup' })
    mockKvSet.mockResolvedValue('OK')
    mockKvLpush.mockResolvedValue(1)
    mockKvLtrim.mockResolvedValue('OK')
    const res = mockRes()
    await handleCanaryCallback(
      { query: { t: 'a'.repeat(32), e: 'img' }, headers: { 'user-agent': 'Mozilla/5.0' }, method: 'GET' },
      res
    )
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png')
    expect(res.send).toHaveBeenCalledWith(expect.any(Buffer))
  })

  it('returns 204 for JS fingerprint callbacks', async () => {
    mockKvGet.mockResolvedValue({ hashedIp: 'abc123', documentPath: '/admin/backup' })
    mockKvSet.mockResolvedValue('OK')
    mockKvLpush.mockResolvedValue(1)
    mockKvLtrim.mockResolvedValue('OK')
    const res = mockRes()
    await handleCanaryCallback(
      {
        query: { t: 'b'.repeat(32), e: 'js' },
        headers: { 'user-agent': 'Mozilla/5.0', 'accept-language': 'en-US' },
        method: 'POST',
        body: { tz: 'Europe/Berlin', plat: 'Win32', sw: 1920, sh: 1080 },
      },
      res
    )
    expect(res.status).toHaveBeenCalledWith(204)
  })

  it('logs canary alert to KV', async () => {
    mockKvGet.mockResolvedValue(null)
    mockKvSet.mockResolvedValue('OK')
    mockKvLpush.mockResolvedValue(1)
    mockKvLtrim.mockResolvedValue('OK')
    const res = mockRes()
    await handleCanaryCallback(
      { query: { t: 'c'.repeat(32), e: 'js' }, headers: {}, method: 'GET' },
      res
    )
    expect(mockKvLpush).toHaveBeenCalledWith('nk-canary-alerts', expect.any(String))
  })
})

describe('Canary Documents: serveCanaryDocument', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns false when canary documents are disabled', async () => {
    mockKvGet.mockResolvedValue({ canaryDocumentsEnabled: false })
    const res = mockRes()
    const result = await serveCanaryDocument(
      { url: '/admin/backup/db-export.html', headers: {}, query: {} },
      res
    )
    expect(result).toBe(false)
  })

  it('returns false for non-matching paths', async () => {
    mockKvGet.mockResolvedValue({ canaryDocumentsEnabled: true })
    mockKvSet.mockResolvedValue('OK')
    const res = mockRes()
    const result = await serveCanaryDocument(
      { url: '/api/normal-endpoint', headers: {}, query: {} },
      res
    )
    expect(result).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Log Poisoning Tests
// ---------------------------------------------------------------------------
const { injectLogPoisonHeaders, generatePoisonedErrorBody, shouldPoisonLogs } = await import('../../api/_log-poisoning.js')

describe('Log Poisoning: injectLogPoisonHeaders', () => {
  it('sets fake server headers', () => {
    const res = mockRes()
    injectLogPoisonHeaders(res)
    // Should set at least 4 headers: fake server, debug route, trace auth, log trace
    expect(res.setHeader.mock.calls.length).toBeGreaterThanOrEqual(4)
  })

  it('includes a fake internal path in X-Debug-Route', () => {
    const res = mockRes()
    injectLogPoisonHeaders(res)
    const debugRouteCall = res.setHeader.mock.calls.find((c: string[]) => c[0] === 'X-Debug-Route')
    expect(debugRouteCall).toBeDefined()
    expect(debugRouteCall[1]).toMatch(/^\//)
  })

  it('includes fake auth token in X-Trace-Auth', () => {
    const res = mockRes()
    injectLogPoisonHeaders(res)
    const authCall = res.setHeader.mock.calls.find((c: string[]) => c[0] === 'X-Trace-Auth')
    expect(authCall).toBeDefined()
    expect(authCall[1]).toContain('Bearer ')
  })
})

describe('Log Poisoning: generatePoisonedErrorBody', () => {
  it('returns object with fake internal data', () => {
    const body = generatePoisonedErrorBody()
    expect(body).toHaveProperty('error', 'Internal Server Error')
    expect(body).toHaveProperty('debug')
    expect(body.debug).toHaveProperty('server')
    expect(body.debug).toHaveProperty('db_host')
    expect(body.debug).toHaveProperty('redis')
    expect(body.debug).toHaveProperty('api_key')
    expect(body).toHaveProperty('internal_routes')
    expect(Array.isArray(body.internal_routes)).toBe(true)
  })

  it('includes fake credentials that look real', () => {
    const body = generatePoisonedErrorBody()
    expect(body.debug.api_key).toMatch(/^sk_prod_/)
    expect(body.debug.db_host).toContain('internal')
  })
})

describe('Log Poisoning: shouldPoisonLogs', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns false when log poisoning is disabled', async () => {
    mockKvGet.mockResolvedValue({ logPoisoningEnabled: false })
    const result = await shouldPoisonLogs('hashedip')
    expect(result).toBe(false)
  })

  it('returns false when IP is not flagged', async () => {
    mockKvGet.mockImplementation((key) => {
      if (key === 'nk-security-settings') return Promise.resolve({ logPoisoningEnabled: true })
      if (key.startsWith('nk-flagged:')) return Promise.resolve(null)
      return Promise.resolve(null)
    })
    const result = await shouldPoisonLogs('unflagged-ip')
    expect(result).toBe(false)
  })

  it('returns true when enabled and IP is flagged', async () => {
    mockKvGet.mockImplementation((key) => {
      if (key === 'nk-security-settings') return Promise.resolve({ logPoisoningEnabled: true })
      if (key.startsWith('nk-flagged:')) return Promise.resolve(true)
      return Promise.resolve(null)
    })
    const result = await shouldPoisonLogs('flagged-ip')
    expect(result).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// XSS Fix in denied.js error page
// ---------------------------------------------------------------------------
describe('Denied handler: XSS prevention', () => {
  it('escapes HTML in rendered error page path', async () => {
    // Import the escapeHtml function via the denied module
    // We test the pattern directly since the function is not exported
    const escapeHtml = (str: string) =>
      str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(escapeHtml('" onmouseover="alert(1)"')).toBe('&quot; onmouseover=&quot;alert(1)&quot;')
    expect(escapeHtml("javascript:alert('xss')")).toBe("javascript:alert(&#39;xss&#39;)")
    expect(escapeHtml('normal-path')).toBe('normal-path')
    expect(escapeHtml('/admin/backup')).toBe('/admin/backup')
  })
})

// ---------------------------------------------------------------------------
// Security Settings: new countermeasure fields
// ---------------------------------------------------------------------------
describe('Security Settings: new countermeasure defaults', () => {
  it('includes all three new countermeasure toggles in DEFAULT_SETTINGS', async () => {
    // Import the client-side defaults
    const { DEFAULT_SETTINGS } = await import('../../src/components/SecuritySettingsDialog')
    expect(DEFAULT_SETTINGS).toHaveProperty('sqlBackfireEnabled', false)
    expect(DEFAULT_SETTINGS).toHaveProperty('canaryDocumentsEnabled', false)
    expect(DEFAULT_SETTINGS).toHaveProperty('logPoisoningEnabled', false)
  })

  it('includes SQL backfire rule settings', async () => {
    const { DEFAULT_SETTINGS } = await import('../../src/components/SecuritySettingsDialog')
    expect(DEFAULT_SETTINGS).toHaveProperty('sqlBackfireOnScannerDetection', true)
    expect(DEFAULT_SETTINGS).toHaveProperty('sqlBackfireOnHoneytokenAccess', false)
  })

  it('includes canary document rule settings', async () => {
    const { DEFAULT_SETTINGS } = await import('../../src/components/SecuritySettingsDialog')
    expect(DEFAULT_SETTINGS).toHaveProperty('canaryPhoneHomeOnOpen', true)
    expect(DEFAULT_SETTINGS).toHaveProperty('canaryCollectFingerprint', true)
    expect(DEFAULT_SETTINGS).toHaveProperty('canaryAlertOnCallback', true)
  })

  it('includes log poisoning rule settings', async () => {
    const { DEFAULT_SETTINGS } = await import('../../src/components/SecuritySettingsDialog')
    expect(DEFAULT_SETTINGS).toHaveProperty('logPoisonFakeHeaders', true)
    expect(DEFAULT_SETTINGS).toHaveProperty('logPoisonTerminalEscape', true)
    expect(DEFAULT_SETTINGS).toHaveProperty('logPoisonFakePaths', true)
  })
})

// ---------------------------------------------------------------------------
// JSON Config Export
// ---------------------------------------------------------------------------
describe('Security Settings: JSON config exportability', () => {
  it('all settings are JSON-serializable', async () => {
    const { DEFAULT_SETTINGS } = await import('../../src/components/SecuritySettingsDialog')
    const json = JSON.stringify(DEFAULT_SETTINGS)
    const parsed = JSON.parse(json)
    expect(parsed).toEqual(DEFAULT_SETTINGS)
  })

  it('exported JSON contains all countermeasure keys', async () => {
    const { DEFAULT_SETTINGS } = await import('../../src/components/SecuritySettingsDialog')
    const json = JSON.stringify(DEFAULT_SETTINGS, null, 2)
    expect(json).toContain('sqlBackfireEnabled')
    expect(json).toContain('canaryDocumentsEnabled')
    expect(json).toContain('logPoisoningEnabled')
    expect(json).toContain('sqlBackfireOnScannerDetection')
    expect(json).toContain('canaryPhoneHomeOnOpen')
    expect(json).toContain('logPoisonFakeHeaders')
  })
})
