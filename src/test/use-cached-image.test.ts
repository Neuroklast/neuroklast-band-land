import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCachedImage } from '@/hooks/use-cached-image'
import * as imageCache from '@/lib/image-cache'

describe('useCachedImage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns empty string for undefined URL', () => {
    const { result } = renderHook(() => useCachedImage(undefined))
    expect(result.current).toBe('')
  })

  it('returns local paths as-is without calling loadCachedImage', () => {
    const spy = vi.spyOn(imageCache, 'loadCachedImage')
    const { result } = renderHook(() => useCachedImage('/baphomet no text.svg'))
    expect(result.current).toBe('/baphomet no text.svg')
    expect(spy).not.toHaveBeenCalled()
  })

  it('returns bundled titel.png as-is without calling loadCachedImage', () => {
    const spy = vi.spyOn(imageCache, 'loadCachedImage')
    const { result } = renderHook(() => useCachedImage('/titel.png'))
    expect(result.current).toBe('/titel.png')
    expect(spy).not.toHaveBeenCalled()
  })

  it('returns data URIs as-is without calling loadCachedImage', () => {
    const spy = vi.spyOn(imageCache, 'loadCachedImage')
    const dataUrl = 'data:image/png;base64,abc123'
    const { result } = renderHook(() => useCachedImage(dataUrl))
    expect(result.current).toBe(dataUrl)
    expect(spy).not.toHaveBeenCalled()
  })

  it('immediately returns wsrv.nl-transformed URL for Google Drive links (synchronous fallback)', () => {
    vi.spyOn(imageCache, 'loadCachedImage').mockResolvedValue('data:image/jpeg;base64,xxx')
    const driveUrl = 'https://drive.google.com/file/d/abc123/view'
    const { result } = renderHook(() => useCachedImage(driveUrl))
    // Before the async loadCachedImage resolves, we should already have the wsrv.nl URL
    expect(result.current).toBe(
      'https://wsrv.nl/?url=https://lh3.googleusercontent.com/d/abc123'
    )
  })

  it('updates to cached data URL once loadCachedImage resolves', async () => {
    const dataUrl = 'data:image/jpeg;base64,cachedData'
    vi.spyOn(imageCache, 'loadCachedImage').mockResolvedValue(dataUrl)

    const driveUrl = 'https://drive.google.com/file/d/abc123/view'
    const { result } = renderHook(() => useCachedImage(driveUrl))

    await waitFor(() => expect(result.current).toBe(dataUrl))
    expect(imageCache.loadCachedImage).toHaveBeenCalledWith(driveUrl)
  })

  it('keeps wsrv.nl URL as fallback when loadCachedImage returns transformed URL on failure', async () => {
    const wsrvUrl = 'https://wsrv.nl/?url=https://lh3.googleusercontent.com/d/abc123'
    vi.spyOn(imageCache, 'loadCachedImage').mockResolvedValue(wsrvUrl)

    const driveUrl = 'https://drive.google.com/file/d/abc123/view'
    const { result } = renderHook(() => useCachedImage(driveUrl))

    await waitFor(() => expect(result.current).toBe(wsrvUrl))
  })

  it('calls loadCachedImage for external non-Drive URLs', async () => {
    const cachedResult = 'data:image/jpeg;base64,externalCached'
    vi.spyOn(imageCache, 'loadCachedImage').mockResolvedValue(cachedResult)

    const externalUrl = 'https://example.com/logo.png'
    const { result } = renderHook(() => useCachedImage(externalUrl))

    await waitFor(() => expect(result.current).toBe(cachedResult))
    expect(imageCache.loadCachedImage).toHaveBeenCalledWith(externalUrl)
  })

  it('does not call loadCachedImage for relative paths', () => {
    const spy = vi.spyOn(imageCache, 'loadCachedImage')
    renderHook(() => useCachedImage('./assets/logo.png'))
    expect(spy).not.toHaveBeenCalled()
  })

  it('does not call loadCachedImage for blob URLs', () => {
    const spy = vi.spyOn(imageCache, 'loadCachedImage')
    renderHook(() => useCachedImage('blob:https://example.com/some-blob'))
    expect(spy).not.toHaveBeenCalled()
  })
})
