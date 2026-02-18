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

type Res = { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn>; setHeader: ReturnType<typeof vi.fn>; send: ReturnType<typeof vi.fn>; redirect: ReturnType<typeof vi.fn> }

function mockRes(): Res {
  const res: Res = {
    status: vi.fn(),
    json: vi.fn(),
    setHeader: vi.fn(),
    send: vi.fn(),
    redirect: vi.fn(),
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
      .mockResolvedValueOnce({ ok: false, status: 403, headers: { get: () => null } })
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
        headers: { get: () => 'application/pdf' },
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

  it('calls Drive API with correct URLs and User-Agent header', async () => {
    const fileContent = new ArrayBuffer(4)
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ name: 'file.zip', mimeType: 'application/zip' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/zip' },
        arrayBuffer: () => Promise.resolve(fileContent),
      })
    const res = mockRes()
    await handler({ method: 'GET', query: { fileId: 'testId123' }, headers: {} }, res)

    // First call: metadata
    const metaUrl = mockFetch.mock.calls[0][0]
    expect(metaUrl).toContain('googleapis.com/drive/v3/files/testId123')
    expect(metaUrl).toContain('fields=')
    expect(metaUrl).toContain('supportsAllDrives=true')

    // Second call: download
    const dlUrl = mockFetch.mock.calls[1][0]
    expect(dlUrl).toContain('drive.google.com/uc')
    expect(dlUrl).toContain('export=download')
    expect(dlUrl).toContain('id=testId123')

    // Verify User-Agent header is sent
    const dlOptions = mockFetch.mock.calls[1][1]
    expect(dlOptions?.headers?.['User-Agent']).toBe('Mozilla/5.0 (compatible; neuroklast-band-land/1.0)')
  })

  it('redirects large files (>10MB) to Google Drive directly', async () => {
    const largeFileSize = 15 * 1024 * 1024 // 15 MB
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ name: 'large-video.mp4', mimeType: 'video/mp4', size: largeFileSize.toString() }),
    })
    const res = mockRes()
    res.redirect = vi.fn()
    await handler({ method: 'GET', query: { fileId: 'largeFileId' }, headers: {} }, res)

    // Should redirect instead of proxying
    expect(res.redirect).toHaveBeenCalled()
    const redirectUrl = res.redirect.mock.calls[0][1]
    expect(redirectUrl).toContain('drive.google.com/uc')
    expect(redirectUrl).toContain('export=download')
    expect(redirectUrl).toContain('id=largeFileId')
    // Should only fetch metadata, not the file content
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('proxies small files (<10MB) through Vercel', async () => {
    const smallFileSize = 5 * 1024 * 1024 // 5 MB
    const fileContent = new ArrayBuffer(smallFileSize)
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ name: 'small.pdf', mimeType: 'application/pdf', size: smallFileSize.toString() }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/pdf' },
        arrayBuffer: () => Promise.resolve(fileContent),
      })
    const res = mockRes()
    res.redirect = vi.fn()
    await handler({ method: 'GET', query: { fileId: 'smallFileId' }, headers: {} }, res)

    // Should proxy, not redirect
    expect(res.redirect).not.toHaveBeenCalled()
    expect(res.send).toHaveBeenCalled()
    // Should fetch both metadata and file content
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('handles virus-scan confirmation page and makes second request', async () => {
    const fileContent = new ArrayBuffer(1024)
    const htmlWithConfirm = `
      <!DOCTYPE html>
      <html>
        <body>
          <form action="https://drive.google.com/uc?export=download&amp;id=testId&amp;confirm=t" method="get">
            <input type="hidden" name="confirm" value="t">
            <button>Download anyway</button>
          </form>
        </body>
      </html>
    `

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ name: 'large-file.zip', mimeType: 'application/zip', size: '5000000' }),
      })
      // First download attempt returns HTML confirmation page
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: (name: string) => (name === 'content-type' ? 'text/html; charset=utf-8' : null) },
        text: () => Promise.resolve(htmlWithConfirm),
      })
      // Second download attempt with confirm token returns actual file
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/zip' },
        arrayBuffer: () => Promise.resolve(fileContent),
      })

    const res = mockRes()
    await handler({ method: 'GET', query: { fileId: 'testId' }, headers: {} }, res)

    // Should make 3 fetch calls: metadata, first download (HTML), second download (file)
    expect(mockFetch).toHaveBeenCalledTimes(3)

    // Verify second download request includes confirm token
    const secondDlUrl = mockFetch.mock.calls[2][0]
    expect(secondDlUrl).toContain('confirm=t')

    // Verify file was sent successfully
    expect(res.send).toHaveBeenCalled()
  })

  it('handles virus-scan confirmation with URL-based confirm token', async () => {
    const fileContent = new ArrayBuffer(1024)
    const htmlWithUrlConfirm = `
      <!DOCTYPE html>
      <html>
        <body>
          <p>Google Drive can't scan this file for viruses.</p>
          <a href="/uc?export=download&amp;id=testId2&amp;confirm=abc123xyz">Download anyway</a>
        </body>
      </html>
    `

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ name: 'another-file.zip', mimeType: 'application/zip', size: '3000000' }),
      })
      // First download returns HTML with confirm in URL
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: (name: string) => (name === 'content-type' ? 'text/html' : null) },
        text: () => Promise.resolve(htmlWithUrlConfirm),
      })
      // Second download with extracted token
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/zip' },
        arrayBuffer: () => Promise.resolve(fileContent),
      })

    const res = mockRes()
    await handler({ method: 'GET', query: { fileId: 'testId2' }, headers: {} }, res)

    // Should make 3 fetch calls
    expect(mockFetch).toHaveBeenCalledTimes(3)

    // Verify second download includes the extracted confirm token
    const secondDlUrl = mockFetch.mock.calls[2][0]
    expect(secondDlUrl).toContain('confirm=abc123xyz')

    expect(res.send).toHaveBeenCalled()
  })

  it('sanitizes filename to prevent header injection', async () => {
    const fileContent = new ArrayBuffer(8)
    // Malicious filename with newlines and quotes
    const maliciousName = 'file"\r\nContent-Type: text/html\r\n\r\n<script>alert("XSS")</script>.pdf'
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ name: maliciousName, mimeType: 'application/pdf', size: '1234' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/pdf' },
        arrayBuffer: () => Promise.resolve(fileContent),
      })
    const res = mockRes()
    await handler({ method: 'GET', query: { fileId: 'abc123' }, headers: {} }, res)

    // Verify that the filename in Content-Disposition header is sanitized
    const dispositionCalls = res.setHeader.mock.calls.filter(call => call[0] === 'Content-Disposition')
    expect(dispositionCalls.length).toBe(1)
    const dispositionValue = dispositionCalls[0][1]
    // Should not contain newlines or unescaped quotes
    expect(dispositionValue).not.toContain('\r')
    expect(dispositionValue).not.toContain('\n')
    expect(res.send).toHaveBeenCalled()
  })
})
