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
// Mock global fetch (used by the handler to proxy Google Drive files)
// ---------------------------------------------------------------------------
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

type SetHeader = ReturnType<typeof vi.fn>
type Res = {
  status: ReturnType<typeof vi.fn>
  json: ReturnType<typeof vi.fn>
  setHeader: SetHeader
  end: ReturnType<typeof vi.fn>
}

function mockRes(): Res & { _piped: boolean } {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
    setHeader: vi.fn(),
    end: vi.fn(),
    _piped: false,
    // Simulate a writable stream for pipe()
    on: vi.fn().mockReturnThis(),
    once: vi.fn().mockReturnThis(),
    emit: vi.fn().mockReturnThis(),
    write: vi.fn(),
  } as unknown as Res & { _piped: boolean }
  res.status.mockReturnValue(res)
  res.json.mockReturnValue(res)
  return res
}

/** Helper: build a minimal ReadableStream that yields one chunk. */
function fakeReadableStream(data: Uint8Array) {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(data)
      controller.close()
    },
  })
}

const { default: handler } = await import('../../api/drive-download.js')

// ---------------------------------------------------------------------------
describe('Drive download API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApplyRateLimit.mockResolvedValue(true)

    // Default happy-path fetch mock
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'application/octet-stream',
        'content-length': '1024',
      }),
      body: fakeReadableStream(new Uint8Array(1024)),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
    })
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

  it('stops if rate limited', async () => {
    mockApplyRateLimit.mockResolvedValue(false)
    const res = mockRes()
    await handler({ method: 'GET', query: { fileId: 'abc123' }, headers: {} }, res)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('proxies the file from Google Drive (no 307 redirect)', async () => {
    const res = mockRes()
    await handler({ method: 'GET', query: { fileId: 'abc123' }, headers: {} }, res)

    // Should fetch from Google Drive server-side
    expect(mockFetch).toHaveBeenCalledWith(
      'https://drive.google.com/uc?export=download&id=abc123',
      { redirect: 'follow' },
    )

    // Should forward headers
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/octet-stream')
    expect(res.setHeader).toHaveBeenCalledWith('Content-Length', '1024')
  })

  it('returns 502 when Google Drive fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('network error'))
    const res = mockRes()
    await handler({ method: 'GET', query: { fileId: 'abc123' }, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(502)
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch file from Google Drive' })
  })

  it('returns 502 when Google Drive returns non-ok status', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers(),
    })
    const res = mockRes()
    await handler({ method: 'GET', query: { fileId: 'abc123' }, headers: {} }, res)
    expect(res.status).toHaveBeenCalledWith(502)
    expect(res.json).toHaveBeenCalledWith({ error: 'Google Drive returned 404' })
  })

  it('sets a fallback Content-Disposition when Google Drive omits it', async () => {
    const res = mockRes()
    await handler({ method: 'GET', query: { fileId: 'test_file-123' }, headers: {} }, res)
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="test_file-123"',
    )
  })
})
