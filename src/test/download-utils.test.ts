import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { extractDriveFileId, downloadFile, extensionFromMime, hasFileExtension, ensureExtension } from '@/lib/download'

describe('extractDriveFileId', () => {
  it('extracts file ID from /file/d/ URL', () => {
    expect(extractDriveFileId('https://drive.google.com/file/d/abc123XYZ/view?usp=sharing'))
      .toBe('abc123XYZ')
  })

  it('extracts file ID from /open?id= URL', () => {
    expect(extractDriveFileId('https://drive.google.com/open?id=def456'))
      .toBe('def456')
  })

  it('extracts file ID from /uc?id= URL', () => {
    expect(extractDriveFileId('https://drive.google.com/uc?id=ghi789&export=download'))
      .toBe('ghi789')
  })

  it('returns null for non-Drive URLs', () => {
    expect(extractDriveFileId('https://example.com/file.zip')).toBeNull()
    expect(extractDriveFileId('https://github.com/file')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(extractDriveFileId('')).toBeNull()
  })

  it('handles IDs with dashes and underscores', () => {
    expect(extractDriveFileId('https://drive.google.com/file/d/abc_123-XYZ/view'))
      .toBe('abc_123-XYZ')
  })
})

describe('downloadFile with Google Drive URLs', () => {
  let originalFetch: typeof globalThis.fetch

  beforeEach(() => {
    originalFetch = globalThis.fetch
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('downloads Google Drive file via fetch-based proxy with progress', async () => {
    const fileId = 'abc123XYZ'
    const driveUrl = `https://drive.google.com/file/d/${fileId}/view`
    const fileName = 'test-file.zip'
    const progressUpdates: Array<{ state: string; progress: number }> = []

    // Mock fetch to return a streamed response via our proxy
    const body = new Uint8Array(100)
    const mockResponse = new Response(body, {
      status: 200,
      headers: { 'Content-Length': '100' },
    })
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse)

    // Mock blob download trigger
    const clickSpy = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName)
      if (tagName === 'a') element.click = clickSpy
      return element
    })
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    await downloadFile(driveUrl, fileName, (progress) => {
      progressUpdates.push({ state: progress.state, progress: progress.progress })
    })

    // Should fetch through the proxy API endpoint
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `/api/drive-download?fileId=${encodeURIComponent(fileId)}`,
    )

    // Verify progress callbacks include downloading states (not just instant complete)
    expect(progressUpdates[0]).toEqual({ state: 'downloading', progress: 0 })
    expect(progressUpdates[progressUpdates.length - 1]).toEqual({ state: 'complete', progress: 1 })

    // Verify intermediate progress was reported (streaming tracks real progress)
    const intermediates = progressUpdates.filter(
      p => p.state === 'downloading' && p.progress > 0 && p.progress < 1,
    )
    expect(intermediates.length).toBeGreaterThan(0)

    // Verify blob download was triggered
    expect(clickSpy).toHaveBeenCalledTimes(1)
  })
})

describe('extensionFromMime', () => {
  it('returns correct extension for common MIME types', () => {
    expect(extensionFromMime('application/pdf')).toBe('.pdf')
    expect(extensionFromMime('image/png')).toBe('.png')
    expect(extensionFromMime('audio/mpeg')).toBe('.mp3')
    expect(extensionFromMime('application/zip')).toBe('.zip')
    expect(extensionFromMime('video/mp4')).toBe('.mp4')
  })

  it('handles MIME types with charset parameters', () => {
    expect(extensionFromMime('text/plain; charset=utf-8')).toBe('.txt')
    expect(extensionFromMime('application/json; charset=utf-8')).toBe('.json')
  })

  it('returns empty string for unknown MIME types', () => {
    expect(extensionFromMime('application/x-custom')).toBe('')
    expect(extensionFromMime('something/unknown')).toBe('')
  })

  it('returns empty string for application/octet-stream', () => {
    expect(extensionFromMime('application/octet-stream')).toBe('')
  })
})

describe('hasFileExtension', () => {
  it('returns true for filenames with extensions', () => {
    expect(hasFileExtension('file.pdf')).toBe(true)
    expect(hasFileExtension('archive.tar.gz')).toBe(true)
    expect(hasFileExtension('photo.jpg')).toBe(true)
  })

  it('returns false for filenames without extensions', () => {
    expect(hasFileExtension('download')).toBe(false)
    expect(hasFileExtension('my-file')).toBe(false)
    expect(hasFileExtension('README')).toBe(false)
  })
})

describe('ensureExtension', () => {
  it('keeps filename unchanged when it already has an extension and no Content-Disposition', () => {
    const response = new Response('', {
      headers: { 'Content-Type': 'application/pdf' },
    })
    expect(ensureExtension('report.pdf', response)).toBe('report.pdf')
  })

  it('adds extension from Content-Type when filename has none', () => {
    const response = new Response('', {
      headers: { 'Content-Type': 'application/pdf' },
    })
    expect(ensureExtension('report', response)).toBe('report.pdf')
  })

  it('adds extension from Content-Disposition when filename has none', () => {
    const response = new Response('', {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="document.docx"',
      },
    })
    expect(ensureExtension('download', response)).toBe('download.docx')
  })

  it('prefers Content-Disposition over Content-Type', () => {
    const response = new Response('', {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="song.mp3"',
      },
    })
    expect(ensureExtension('track', response)).toBe('track.mp3')
  })

  it('returns filename unchanged when no extension can be determined', () => {
    const response = new Response('', {
      headers: { 'Content-Type': 'application/octet-stream' },
    })
    expect(ensureExtension('data', response)).toBe('data')
  })

  it('adds extension from Content-Type with charset parameter', () => {
    const response = new Response('', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
    expect(ensureExtension('notes', response)).toBe('notes.txt')
  })

  it('replaces existing extension with Content-Disposition extension', () => {
    const response = new Response('', {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': 'attachment; filename="original-track.wav"',
      },
    })
    expect(ensureExtension('track.mp3', response)).toBe('track.wav')
  })

  it('replaces wrong extension when Content-Disposition provides the original', () => {
    const response = new Response('', {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="archive.zip"',
      },
    })
    expect(ensureExtension('press-kit.pdf', response)).toBe('press-kit.zip')
  })
})
