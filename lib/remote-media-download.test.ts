import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchUrlWithResolvedCheck } from '@/lib/ssrf-guard'
import { downloadRemoteMediaBuffer } from './remote-media-download'

vi.mock('@/lib/ssrf-guard', () => ({ fetchUrlWithResolvedCheck: vi.fn() }))

const fetchMock = vi.mocked(fetchUrlWithResolvedCheck)

afterEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
})

const options = (kind: 'image' | 'video') => ({
  kind,
  url: 'https://cdn.example.com/asset',
  timeoutMs: 1000,
  isAllowedContentType: (value: string | null) => value === (kind === 'image' ? 'image/png' : 'video/mp4'),
  assertSize: (size: number) => {
    if (size > 5) throw new Error('too large')
    if (size === 0) throw new Error('empty')
  },
})

describe('remote media download', () => {
  it.each(['image', 'video'] as const)('keeps guarded headers, limits and bytes for %s', async (kind) => {
    const mime = kind === 'image' ? 'image/png' : 'video/mp4'
    fetchMock.mockResolvedValueOnce(new Response('data', { headers: { 'content-type': mime } }))
    const result = await downloadRemoteMediaBuffer(options(kind))
    expect(result.buffer.toString()).toBe('data')
    expect(result.contentType).toBe(mime)
    expect(fetchMock).toHaveBeenCalledWith('https://cdn.example.com/asset', expect.objectContaining({
      method: 'GET',
      headers: { Accept: `${kind}/*,application/octet-stream`, 'User-Agent': 'NeuroklastAdmin/1.0' },
      signal: expect.any(AbortSignal),
    }))
  })

  it('preserves HTTP failure and content type errors', async () => {
    fetchMock.mockResolvedValueOnce(new Response('', { status: 404 }))
    await expect(downloadRemoteMediaBuffer(options('image'))).rejects.toThrow('Failed to download image (HTTP 404)')
    fetchMock.mockResolvedValueOnce(new Response('x', { headers: { 'content-type': 'text/html' } }))
    await expect(downloadRemoteMediaBuffer(options('video'))).rejects.toThrow('URL did not return a video')
  })

  it('enforces caller supplied size validation', async () => {
    fetchMock.mockResolvedValueOnce(new Response('123456', { headers: { 'content-type': 'image/png' } }))
    await expect(downloadRemoteMediaBuffer(options('image'))).rejects.toThrow('too large')
  })

  it('aborts downloads with the original type-specific timeout message', async () => {
    vi.useFakeTimers()
    fetchMock.mockImplementationOnce(async (_url, init) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => {
        const error = new Error('aborted')
        error.name = 'AbortError'
        reject(error)
      })
    }))
    const promise = downloadRemoteMediaBuffer(options('video'))
    const assertion = expect(promise).rejects.toThrow('Video download timed out')
    await vi.advanceTimersByTimeAsync(1000)
    await assertion
  })
})
