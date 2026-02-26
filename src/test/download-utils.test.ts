import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { extractDriveFileId, downloadFile } from '@/lib/download'

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

    // Verify blob download was triggered
    expect(clickSpy).toHaveBeenCalledTimes(1)
  })
})
