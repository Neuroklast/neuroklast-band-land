import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock rate limiter
// ---------------------------------------------------------------------------
const mockApplyRateLimit = vi.fn()

vi.mock('../../api/_ratelimit.js', () => ({
  applyRateLimit: (...args: unknown[]) => mockApplyRateLimit(...args),
  hashIp: vi.fn().mockReturnValue('hashed-ip'),
  getClientIp: vi.fn().mockReturnValue('1.2.3.4'),
}))

// ---------------------------------------------------------------------------
// Mock global fetch
// ---------------------------------------------------------------------------
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

type Res = { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn>; setHeader: ReturnType<typeof vi.fn>; send: ReturnType<typeof vi.fn> }

function mockRes(): Res {
  const res: Res = {
    status: vi.fn(),
    json: vi.fn(),
    setHeader: vi.fn(),
    send: vi.fn(),
  }
  res.status.mockReturnValue(res)
  res.json.mockReturnValue(res)
  return res
}

const { default: handler } = await import('../../api/drive-download.js')

// ---------------------------------------------------------------------------
describe('Drive download API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApplyRateLimit.mockResolvedValue(true)
    process.env.GOOGLE_DRIVE_API_KEY = 'test-api-key'
  })

  it('rejects non-GET methods with 405', async () => {
    const res = mockRes()
    await handler({ method: 'POST', query: {}, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' })
  })

  it('returns 400 for missing fileId', async () => {
    const res = mockRes()
    await handler({ method: 'GET', query: {}, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 400 for invalid fileId format', async () => {
    const res = mockRes()
    await handler({ method: 'GET', query: { fileId: '../../../etc/passwd' }, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 500 when API key is not configured', async () => {
    delete process.env.GOOGLE_DRIVE_API_KEY
    const res = mockRes()
    await handler({ method: 'GET', query: { fileId: 'abc123' }, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Drive API key is not configured' })
  })

  it('returns 502 when Drive metadata API fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 })
    const res = mockRes()
    await handler({ method: 'GET', query: { fileId: 'abc123' }, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(502)
  })

  it('returns 502 when Drive download API fails', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ name: 'test.pdf', mimeType: 'application/pdf', size: '1234' }),
      })
      .mockResolvedValueOnce({ ok: false, status: 403 })
    const res = mockRes()
    await handler({ method: 'GET', query: { fileId: 'abc123' }, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(502)
  })

  it('downloads file successfully with correct headers', async () => {
    const fileContent = new ArrayBuffer(8)
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ name: 'test.pdf', mimeType: 'application/pdf', size: '1234' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(fileContent),
      })
    const res = mockRes()
    await handler({ method: 'GET', query: { fileId: 'abc123' }, headers: {} }, res)
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf')
    expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="test.pdf"')
    expect(res.setHeader).toHaveBeenCalledWith('Content-Length', '1234')
    expect(res.send).toHaveBeenCalled()
  })

  it('stops if rate limited', async () => {
    mockApplyRateLimit.mockResolvedValue(false)
    const res = mockRes()
    await handler({ method: 'GET', query: { fileId: 'abc123' }, headers: {} }, res)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('calls Drive API with correct URLs', async () => {
    const fileContent = new ArrayBuffer(4)
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ name: 'file.zip', mimeType: 'application/zip' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(fileContent),
      })
    const res = mockRes()
    await handler({ method: 'GET', query: { fileId: 'testId123' }, headers: {} }, res)

    // First call: metadata
    const metaUrl = mockFetch.mock.calls[0][0]
    expect(metaUrl).toContain('googleapis.com/drive/v3/files/testId123')
    expect(metaUrl).toContain('fields=')

    // Second call: download
    const dlUrl = mockFetch.mock.calls[1][0]
    expect(dlUrl).toContain('googleapis.com/drive/v3/files/testId123')
    expect(dlUrl).toContain('alt=media')
  })
})
