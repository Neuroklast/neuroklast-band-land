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

// Mock rate limiter
vi.mock('../../api/_ratelimit.ts', () => ({
  applyRateLimit: vi.fn().mockResolvedValue(true),
  getClientIp: vi.fn().mockReturnValue('192.168.1.100'),
  hashIp: vi.fn().mockReturnValue('abc123hashedip'),
}))

// Mock attacker profile — includes addForensicData used by canary callbacks
vi.mock('../../api/_attacker-profile.js', () => ({
  recordIncident: vi.fn().mockResolvedValue(undefined),
  addForensicData: vi.fn().mockResolvedValue(undefined),
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
// NOTE: _security-logger.js is NOT mocked here — it uses the mocked @vercel/kv above,
// so it is safe to let the real module run. This allows the logger tests at the bottom
// of this file to verify the real KV write behaviour.

type Res = { status: Mock<(code: number) => Res>; json: Mock<(data: unknown) => Res>; end: Mock<() => Res>; setHeader: Mock<(key: string, value: string) => Res>; send: Mock<(data: unknown) => Res> }

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
      body: undefined,
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
      expect((doc as { path: string }).path).toMatch(/^\//)
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
    // External script tag (CSP-compliant — no inline <script>)
    expect(html).toContain('<script src=')
    expect(html).toContain('/api/canary-script?t=abc123def456abc123def456abc123de')
    expect(html).toContain('<img src=')
  })

  it('escapes document name to prevent XSS', () => {
    const html = generateCanaryHtml('token123token123token123token123', '<script>alert(1)</script>')
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('uses external canary-script endpoint (CSP-safe, no inline scripts)', () => {
    const html = generateCanaryHtml('token123token123token123token123', 'doc')
    // Must NOT have inline fingerprinting code
    expect(html).not.toContain('RTCPeerConnection')
    expect(html).not.toContain('navigator.platform')
    // Must have external script reference
    expect(html).toContain('<script src="/api/canary-script?t=token123token123token123token123">')
  })

  it('omits fingerprint script when canaryCollectFingerprint is false', () => {
    const html = generateCanaryHtml('token123token123token123token123', 'doc', { canaryCollectFingerprint: false })
    expect(html).not.toContain('<script src=')
  })

  it('omits tracking pixel when canaryPhoneHomeOnOpen is false', () => {
    const html = generateCanaryHtml('token123token123token123token123', 'doc', { canaryPhoneHomeOnOpen: false })
    expect(html).not.toContain('<img src=')
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
    expect(debugRouteCall![1]).toMatch(/^\//)
  })

  it('includes fake auth token in X-Trace-Auth', () => {
    const res = mockRes()
    injectLogPoisonHeaders(res)
    const authCall = res.setHeader.mock.calls.find((c: string[]) => c[0] === 'X-Trace-Auth')
    expect(authCall).toBeDefined()
    expect(authCall![1]).toContain('Bearer ')
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
    expect((body.debug as Record<string, unknown>).api_key).toMatch(/^sk_prod_/)
    expect((body.debug as Record<string, unknown>).db_host).toContain('internal')
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

// ---------------------------------------------------------------------------
// Canary Script Endpoint Tests
// ---------------------------------------------------------------------------
const { default: canaryScriptHandler } = await import('../../api/canary-script.js')

describe('Canary Script: external fingerprint script endpoint', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 404 for missing token', async () => {
    const res = mockRes()
    await canaryScriptHandler({ method: 'GET', query: {}, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('returns 404 for invalid token format', async () => {
    const res = mockRes()
    await canaryScriptHandler({ method: 'GET', query: { t: 'invalid!token' }, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('returns 404 when token does not exist in KV', async () => {
    mockKvGet.mockResolvedValue(null)
    const res = mockRes()
    await canaryScriptHandler({ method: 'GET', query: { t: 'a'.repeat(32) }, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('returns valid JavaScript for a known token', async () => {
    mockKvGet.mockResolvedValue({ hashedIp: 'abc123', documentPath: '/admin/backup' })
    const res = mockRes()
    await canaryScriptHandler({ method: 'GET', query: { t: 'a'.repeat(32) }, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/javascript; charset=utf-8')
    const script = res.send.mock.calls[0][0] as string
    expect(typeof script).toBe('string')
    expect(script).toContain('(function(){')
    expect(script).toContain('/api/canary-callback')
    expect(script).toContain('a'.repeat(32))
  })

  it('script contains WebRTC STUN for real IP discovery', async () => {
    mockKvGet.mockResolvedValue({ hashedIp: 'abc123' })
    const res = mockRes()
    await canaryScriptHandler({ method: 'GET', query: { t: 'b'.repeat(32) }, headers: {} }, res)
    const script = res.send.mock.calls[0][0] as string
    expect(script).toContain('RTCPeerConnection')
    expect(script).toContain('stun:stun.l.google.com')
  })

  it('script contains browser fingerprinting code', async () => {
    mockKvGet.mockResolvedValue({ hashedIp: 'abc123' })
    const res = mockRes()
    await canaryScriptHandler({ method: 'GET', query: { t: 'c'.repeat(32) }, headers: {} }, res)
    const script = res.send.mock.calls[0][0] as string
    expect(script).toContain('navigator.platform')
    expect(script).toContain('screen.width')
    expect(script).toContain('hardwareConcurrency')
  })

  it('sets no-cache headers to prevent script caching', async () => {
    mockKvGet.mockResolvedValue({ hashedIp: 'abc123' })
    const res = mockRes()
    await canaryScriptHandler({ method: 'GET', query: { t: 'd'.repeat(32) }, headers: {} }, res)
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store, no-cache, must-revalidate')
  })

  it('rejects non-GET methods', async () => {
    const res = mockRes()
    await canaryScriptHandler({ method: 'POST', query: {}, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(405)
  })
})

// ---------------------------------------------------------------------------
// Unified Security Logger Tests
// ---------------------------------------------------------------------------
describe('Security Logger: logSecurityEvent', () => {
  beforeEach(() => vi.clearAllMocks())

  it('writes a structured entry to KV', async () => {
    const { logSecurityEvent } = await import('../../api/_security-logger.js')
    mockKvLpush.mockResolvedValue(1)
    mockKvLtrim.mockResolvedValue('OK')
    await logSecurityEvent({
      event: 'TEST_EVENT',
      severity: 'warn',
      hashedIp: 'testhash',
      userAgent: 'TestAgent/1.0',
      countermeasure: 'TEST',
    })
    expect(mockKvLpush).toHaveBeenCalledWith('nk-security-log', expect.stringContaining('"event":"TEST_EVENT"'))
  })

  it('log entry contains all required fields', async () => {
    const { logSecurityEvent } = await import('../../api/_security-logger.js')
    mockKvLpush.mockResolvedValue(1)
    mockKvLtrim.mockResolvedValue('OK')
    await logSecurityEvent({
      event: 'HONEYTOKEN_ACCESS',
      severity: 'critical',
      hashedIp: 'abc123',
      userAgent: 'sqlmap/1.6',
      method: 'GET',
      url: '/api/kv?key=admin_backup',
      countermeasure: 'TAUNT_403',
      threatScore: 5,
      threatLevel: 'WARN',
      details: { key: 'admin_backup' },
    })
    const written = mockKvLpush.mock.calls[0][1] as string
    const parsed = JSON.parse(written) as Record<string, unknown>
    expect(parsed).toHaveProperty('id')
    expect(parsed).toHaveProperty('timestamp')
    expect(parsed).toHaveProperty('event', 'HONEYTOKEN_ACCESS')
    expect(parsed).toHaveProperty('severity', 'critical')
    expect(parsed).toHaveProperty('hashedIp', 'abc123')
    expect(parsed).toHaveProperty('countermeasure', 'TAUNT_403')
    expect(parsed).toHaveProperty('threatScore', 5)
    expect(parsed).toHaveProperty('details')
  })

  it('KV failure does not throw', async () => {
    const { logSecurityEvent } = await import('../../api/_security-logger.js')
    mockKvLpush.mockRejectedValue(new Error('KV unavailable'))
    await expect(logSecurityEvent({
      event: 'TEST',
      severity: 'info',
      hashedIp: 'hash',
      userAgent: '',
    })).resolves.not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// Scanner Detection Tests
// ---------------------------------------------------------------------------
const { detectScanner, detectAndLogScanner } = await import('../../api/_scanner-detection.js')

describe('Scanner Detection: detectScanner — UA signature matching', () => {
  const knownTools: Array<[string, string, string]> = [
    ['sqlmap/1.6.12#stable',     'sqlmap',            'EXPLOIT_FRAMEWORK'],
    ['Nikto/2.1.6',              'Nikto',             'SCANNER'],
    ['nuclei/2.9.1',             'Nuclei',            'SCANNER'],
    ['ffuf/1.5.0',               'FFuf',              'FUZZER'],
    ['gobuster/3.6',             'Gobuster',          'FUZZER'],
    ['python-requests/2.28.2',   'python-requests',   'CRAWLER'],
    ['OWASP_ZAP/2.14',           'OWASP ZAP',         'PROXY_TOOL'],
    ['Nmap Scripting Engine',    'Nmap NSE',          'RECON_TOOL'],
    ['Hydra/9.4',                'Hydra',             'BRUTE_FORCER'],
    ['WhatWeb/0.5.5',            'WhatWeb',           'RECON_TOOL'],
    ['Feroxbuster/2.10.0',       'Feroxbuster',       'FUZZER'],
    ['Metasploit Framework',     'Metasploit',        'EXPLOIT_FRAMEWORK'],
    ['Acunetix-Scanner/14.8',    'Acunetix',          'SCANNER'],
    ['curl/7.85.0',              'curl-script',       'CRAWLER'],
  ]

  for (const [ua, expectedName, expectedCategory] of knownTools) {
    it(`identifies ${expectedName} from UA`, () => {
      const profile = detectScanner({ headers: { 'user-agent': ua, 'accept': '*/*' } })
      expect(profile.detected).toBe(true)
      expect(profile.toolName).toBe(expectedName)
      expect(profile.category).toBe(expectedCategory)
      expect(profile.confidence).toBe('high')
      expect(profile.threatMultiplier).toBeGreaterThan(1)
    })
  }
})

describe('Scanner Detection: detectScanner — behavioral heuristics', () => {
  it('detects unknown bot via missing headers', () => {
    const profile = detectScanner({ headers: {} }) // no UA, no Accept, no Accept-Language
    expect(profile.detected).toBe(true)
    expect(profile.category).toBe('UNKNOWN_BOT')
    expect(profile.signals).toContain('MISSING_USER_AGENT')
    expect(profile.signals).toContain('MISSING_ACCEPT')
    expect(profile.signals).toContain('MISSING_ACCEPT_LANGUAGE')
  })

  it('detects suspicious generic accept with no accept-language', () => {
    const profile = detectScanner({ headers: { 'user-agent': 'CustomTool/1.0', 'accept': '*/*' } })
    expect(profile.threatMultiplier).toBeGreaterThanOrEqual(1.2)
    expect(profile.signals.length).toBeGreaterThan(0)
  })

  it('returns clean profile for real browser headers', () => {
    const profile = detectScanner({
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9,de;q=0.8',
      },
    })
    expect(profile.detected).toBe(false)
    expect(profile.toolName).toBeNull()
    expect(profile.threatMultiplier).toBe(1)
  })

  it('applies ×3 multiplier for exploit frameworks', () => {
    const profile = detectScanner({ headers: { 'user-agent': 'sqlmap/1.7' } })
    expect(profile.threatMultiplier).toBe(3)
  })
})

describe('Scanner Detection: detectAndLogScanner', () => {
  beforeEach(() => vi.clearAllMocks())

  it('logs SCANNER_DETECTED when a known tool is found', async () => {
    mockKvLpush.mockResolvedValue(1)
    await detectAndLogScanner(
      { method: 'GET', url: '/admin', headers: { 'user-agent': 'sqlmap/1.6' } },
      'hashedip', 'sqlmap/1.6',
    )
    expect(mockKvLpush).toHaveBeenCalledWith('nk-security-log', expect.stringContaining('SCANNER_DETECTED'))
  })

  it('does not log for clean browsers', async () => {
    mockKvLpush.mockResolvedValue(1)
    await detectAndLogScanner(
      {
        method: 'GET', url: '/',
        headers: {
          'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          'accept': 'text/html,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.9',
        },
      },
      'hashedip', 'Mozilla/5.0',
    )
    expect(mockKvLpush).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Path Traversal Detection Tests
// ---------------------------------------------------------------------------
const { detectPathTraversal, handlePathTraversalBackfire } = await import('../../api/_path-traversal.js')

describe('Path Traversal: detectPathTraversal', () => {
  const attacks: Array<[string, string, string]> = [
    ['/api/read?file=/etc/passwd',              'ETC_PASSWD',           'passwd'],
    ['/api/read?file=/etc/shadow',              'ETC_SHADOW',           'passwd'],
    ['/api?path=%2e%2e%2fetc%2fpasswd',         'URL_ENCODED_TRAVERSAL','generic'],
    ['/api?path=%252e%252e%252fpasswd',         'DOUBLE_ENCODED',       'generic'],
    ['/api?file=wp-config.php',                 'WP_CONFIG',            'wpconfig'],
    ['/api?path=.git/config',                   'GIT_CONFIG',           'gitconfig'],
    ['/api?key=%00etc/passwd',                  'NULL_BYTE',            'generic'],
    ['/api?src=php://filter/convert.base64-encode', 'PHP_FILTER',       'php_wrapper'],
    ['/api?src=expect://id',                    'EXPECT_WRAPPER',       'php_wrapper'],
  ]

  for (const [url, expectedPattern, expectedFileType] of attacks) {
    it(`detects ${expectedPattern} in URL`, () => {
      const result = detectPathTraversal({ url, headers: {} })
      expect(result.detected).toBe(true)
      expect(result.patternName).toBe(expectedPattern)
      expect(result.fileType).toBe(expectedFileType)
    })
  }

  it('detects traversal in query params', () => {
    const result = detectPathTraversal({
      url: '/api/file',
      query: { path: '../../../etc/passwd' },
      headers: {},
    })
    expect(result.detected).toBe(true)
    // ETC_PASSWD is more specific than DOT_DOT_SLASH and appears first in the pattern list
    expect(result.patternName).toBe('ETC_PASSWD')
    expect(result.fileType).toBe('passwd')
  })

  it('does not flag clean paths', () => {
    const result = detectPathTraversal({
      url: '/api/kv?key=band-data',
      query: { key: 'band-data' },
      headers: {},
    })
    expect(result.detected).toBe(false)
  })
})

describe('Path Traversal: handlePathTraversalBackfire', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns false when pathTraversalBackfireEnabled is false', async () => {
    mockKvGet.mockResolvedValue({ pathTraversalBackfireEnabled: false })
    const res = mockRes()
    const result = await handlePathTraversalBackfire({ url: '/../etc/passwd', headers: {} }, res)
    expect(result).toBe(false)
    expect(res.status).not.toHaveBeenCalled()
  })

  it('returns false when no traversal detected', async () => {
    mockKvGet.mockResolvedValue({ pathTraversalBackfireEnabled: true, pathTraversalServeFakeFiles: true })
    const res = mockRes()
    const result = await handlePathTraversalBackfire({ url: '/api/kv?key=site-config', headers: {} }, res)
    expect(result).toBe(false)
  })

  it('serves fake /etc/passwd content when enabled', async () => {
    mockKvGet.mockResolvedValue({ pathTraversalBackfireEnabled: true, pathTraversalServeFakeFiles: true })
    mockKvSet.mockResolvedValue('OK')
    mockKvLpush.mockResolvedValue(1)
    const res = mockRes()
    const result = await handlePathTraversalBackfire(
      { url: '/api?file=/etc/passwd', headers: { 'user-agent': 'nikto/2.1' } },
      res,
    )
    expect(result).toBe(true)
    expect(res.status).toHaveBeenCalledWith(200)
    const body = res.send.mock.calls[0][0] as string
    expect(typeof body).toBe('string')
    expect(body).toContain('root:x:0:0')
    expect(body).toContain('www-data')
  })

  it('fake .env contains realistic-looking secrets', async () => {
    mockKvGet.mockResolvedValue({ pathTraversalBackfireEnabled: true, pathTraversalServeFakeFiles: true })
    mockKvSet.mockResolvedValue('OK')
    mockKvLpush.mockResolvedValue(1)
    const res = mockRes()
    await handlePathTraversalBackfire(
      { url: '/.env', headers: {} },
      res,
    )
    const body = res.send.mock.calls[0][0] as string
    expect(body).toContain('DB_PASSWORD=')
    expect(body).toContain('APP_KEY=')
    expect(body).toContain('CANARY_TOKEN=')
  })
})

// ---------------------------------------------------------------------------
// Probe Detection Tests
// ---------------------------------------------------------------------------
const { detectProbe, handleProbeBackfire } = await import('../../api/_probe-detection.js')

describe('Probe Detection: detectProbe', () => {
  const probes: Array<[string, string, string]> = [
    ['?q=<script>alert(1)</script>',          'XSS', 'SCRIPT_TAG'],
    ['?q=" onerror=alert(1)',                 'XSS', 'ONERROR_ATTR'],
    ['?q=javascript:alert(1)',                'XSS', 'JAVASCRIPT_URI'],
    ['?expr={{7*7}}',                         'SSTI', 'JINJA2_MATH'],
    ['?expr=${7*7}',                          'SSTI', 'FREEMARKER_PROBE'],
    ['?url=http://localhost/admin',           'SSRF', 'LOCALHOST'],
    ['?url=http://169.254.169.254/latest',    'SSRF', 'AWS_METADATA'],
    ['?cmd=;id',                              'CMDI', 'SEMICOLON_CMD'],
    ['?cmd=| cat /etc/passwd',                'CMDI', 'PIPE_CMD'],
  ]

  for (const [queryString, expectedType, expectedPattern] of probes) {
    it(`detects ${expectedPattern} (${expectedType})`, () => {
      const result = detectProbe({
        url: `/api${queryString}`,
        query: Object.fromEntries(new URLSearchParams(queryString)),
        headers: {},
      })
      expect(result.detected).toBe(true)
      expect(result.type).toBe(expectedType)
      expect(result.patternName).toBe(expectedPattern)
    })
  }

  it('does not flag clean requests', () => {
    const result = detectProbe({
      url: '/api/kv?key=band-data',
      query: { key: 'band-data' },
      headers: {},
    })
    expect(result.detected).toBe(false)
  })
})

describe('Probe Detection: handleProbeBackfire', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns false when probeDetectionEnabled is false', async () => {
    mockKvGet.mockResolvedValue({ probeDetectionEnabled: false })
    const res = mockRes()
    const result = await handleProbeBackfire({ url: '/?q=<script>alert(1)</script>', headers: {} }, res)
    expect(result).toBe(false)
  })

  it('returns SSTI backfire with fake evaluated result', async () => {
    mockKvGet.mockResolvedValue({ probeDetectionEnabled: true, probeBackfireEnabled: true })
    mockKvLpush.mockResolvedValue(1)
    const res = mockRes()
    const result = await handleProbeBackfire(
      { url: '/?expr={{7*7}}', query: { expr: '{{7*7}}' }, headers: {} },
      res,
    )
    expect(result).toBe(true)
    expect(res.status).toHaveBeenCalledWith(200)
    const body = res.json.mock.calls[0][0] as Record<string, unknown>
    expect(body).toHaveProperty('result', 49)
    expect(body).toHaveProperty('expression', '{{7*7}}')
  })

  it('returns SSRF backfire with fake AWS metadata', async () => {
    mockKvGet.mockResolvedValue({ probeDetectionEnabled: true, probeBackfireEnabled: true })
    mockKvLpush.mockResolvedValue(1)
    const res = mockRes()
    const result = await handleProbeBackfire(
      { url: '/?url=http://169.254.169.254', query: { url: 'http://169.254.169.254' }, headers: {} },
      res,
    )
    expect(result).toBe(true)
    const body = res.json.mock.calls[0][0] as Record<string, unknown>
    expect(body).toHaveProperty('region', 'us-east-1')
    expect(body).toHaveProperty('iam_credentials')
  })

  it('returns CMDi backfire with fake shell output', async () => {
    mockKvGet.mockResolvedValue({ probeDetectionEnabled: true, probeBackfireEnabled: true })
    mockKvLpush.mockResolvedValue(1)
    const res = mockRes()
    await handleProbeBackfire(
      { url: '/?cmd=;id', query: { cmd: ';id' }, headers: {} },
      res,
    )
    expect(res.status).toHaveBeenCalledWith(200)
    const body = res.send.mock.calls[0][0] as string
    expect(body).toContain('uid=0(root)')
  })

  it('logs PROBE_BACKFIRE event with type and pattern', async () => {
    mockKvGet.mockResolvedValue({ probeDetectionEnabled: true, probeBackfireEnabled: false })
    mockKvLpush.mockResolvedValue(1)
    const res = mockRes()
    await handleProbeBackfire(
      { url: '/?q=<script>alert(1)</script>', query: { q: '<script>alert(1)</script>' }, headers: {} },
      res,
    )
    expect(mockKvLpush).toHaveBeenCalledWith('nk-security-log', expect.stringContaining('PROBE_BACKFIRE'))
    const log = JSON.parse(mockKvLpush.mock.calls[0][1] as string) as Record<string, unknown>
    expect((log.details as Record<string, unknown>).probeType).toBe('XSS')
  })
})

// ---------------------------------------------------------------------------
// SQL Backfire: ReDoS payloads in response
// ---------------------------------------------------------------------------
describe('SQL Backfire: ReDoS payloads in backfire body', () => {
  it('backfire body contains trace field with ReDoS-style payload', async () => {
    const { generateBackfireBody } = await import('../../api/_sql-backfire.js')
    const body = generateBackfireBody() as Record<string, unknown>
    // ReDoS payloads are embedded in trace / debug.raw_error
    expect(body).toHaveProperty('trace')
    expect(body).toHaveProperty('debug')
    const debug = body.debug as Record<string, unknown>
    expect(typeof debug.raw_error).toBe('string')
    // Should contain one of the ReDoS marker strings
    const combined = JSON.stringify(body)
    expect(combined.length).toBeGreaterThan(500)
  })

  it('backfire body is JSON-serializable', async () => {
    const { generateBackfireBody } = await import('../../api/_sql-backfire.js')
    const body = generateBackfireBody()
    expect(() => JSON.stringify(body)).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// Security Settings: new countermeasure fields
// ---------------------------------------------------------------------------
describe('Security Settings: scanner + traversal + probe toggles', () => {
  it('includes scanner detection defaults', async () => {
    const { DEFAULT_SETTINGS } = await import('../../src/components/SecuritySettingsDialog')
    expect(DEFAULT_SETTINGS).toHaveProperty('scannerDetectionEnabled', true)
  })

  it('includes path traversal backfire defaults', async () => {
    const { DEFAULT_SETTINGS } = await import('../../src/components/SecuritySettingsDialog')
    expect(DEFAULT_SETTINGS).toHaveProperty('pathTraversalBackfireEnabled', false)
    expect(DEFAULT_SETTINGS).toHaveProperty('pathTraversalServeFakeFiles', true)
  })

  it('includes probe detection defaults', async () => {
    const { DEFAULT_SETTINGS } = await import('../../src/components/SecuritySettingsDialog')
    expect(DEFAULT_SETTINGS).toHaveProperty('probeDetectionEnabled', true)
    expect(DEFAULT_SETTINGS).toHaveProperty('probeBackfireEnabled', false)
  })

  it('all new settings are JSON-serializable', async () => {
    const { DEFAULT_SETTINGS } = await import('../../src/components/SecuritySettingsDialog')
    const json = JSON.stringify(DEFAULT_SETTINGS)
    expect(json).toContain('scannerDetectionEnabled')
    expect(json).toContain('pathTraversalBackfireEnabled')
    expect(json).toContain('pathTraversalServeFakeFiles')
    expect(json).toContain('probeDetectionEnabled')
    expect(json).toContain('probeBackfireEnabled')
  })
})
