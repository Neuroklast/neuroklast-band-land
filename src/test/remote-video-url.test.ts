import { describe, expect, it } from 'vitest'
import { resolveRemoteImageUrl } from '@/lib/remote-image-url'
import {
  assertRemoteVideoSize,
  isAllowedVideoContentType,
  resolveRemoteVideoUrl,
  REMOTE_VIDEO_MAX_BYTES,
} from '@/lib/remote-video-url'

describe('remote-video-url', () => {
  it.each([
    '',
    'https://cdn.example.com/bg.mp4',
    'https://drive.google.com/file/d/vid123/view',
    'http://cdn.example.com/bg.mp4',
    'https://localhost/private.mp4',
    'javascript:alert(1)',
  ])('shares the image importer URL policy for %s', (url) => {
    expect(resolveRemoteVideoUrl(url)).toEqual(resolveRemoteImageUrl(url))
  })

  it('resolves Google Drive share links', () => {
    const resolved = resolveRemoteVideoUrl('https://drive.google.com/file/d/vid123/view')
    expect(resolved?.source).toBe('google_drive')
    expect(resolved?.url).toContain('vid123')
  })

  it('allows HTTPS video URLs', () => {
    const resolved = resolveRemoteVideoUrl('https://cdn.example.com/bg.mp4')
    expect(resolved?.source).toBe('direct')
  })

  it('rejects non-HTTPS URLs', () => {
    expect(resolveRemoteVideoUrl('http://example.com/a.mp4')).toBeNull()
  })

  it('validates video content types', () => {
    expect(isAllowedVideoContentType('video/mp4')).toBe(true)
    expect(isAllowedVideoContentType('video/webm')).toBe(true)
    expect(isAllowedVideoContentType('image/jpeg')).toBe(false)
  })

  it('enforces max video size', () => {
    expect(() => assertRemoteVideoSize(REMOTE_VIDEO_MAX_BYTES + 1)).toThrow(/too large/)
    expect(() => assertRemoteVideoSize(0)).toThrow(/empty/)
  })
})