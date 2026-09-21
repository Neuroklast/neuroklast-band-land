import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildImageSrcSet,
  isOptimizerAllowed,
  largestWidth,
  parseImageCdnMode,
  resolveCdnImageUrl,
} from '@/lib/image-cdn'

const R2_URL = 'https://pub-1671fbb9f0a645bd8f2dcebf617d504b.r2.dev/covers/album.webp'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('parseImageCdnMode', () => {
  it('accepts known modes', () => {
    expect(parseImageCdnMode({ mode: 'vercel' })).toBe('vercel')
    expect(parseImageCdnMode({ mode: 'direct' })).toBe('direct')
    expect(parseImageCdnMode({ mode: 'wsrv' })).toBe('wsrv')
  })

  it('falls back to wsrv for unknown shapes', () => {
    expect(parseImageCdnMode(null)).toBe('wsrv')
    expect(parseImageCdnMode({ mode: 'ftp' })).toBe('wsrv')
    expect(parseImageCdnMode('vercel')).toBe('wsrv')
  })
})

describe('resolveCdnImageUrl', () => {
  it('passes relative, data and empty URLs through unchanged', () => {
    expect(resolveCdnImageUrl('/brand/logo.svg', 'wsrv', { w: 400 })).toBe('/brand/logo.svg')
    expect(resolveCdnImageUrl('data:image/png;base64,AAAA', 'wsrv')).toBe('data:image/png;base64,AAAA')
    expect(resolveCdnImageUrl('', 'wsrv')).toBe('')
    expect(resolveCdnImageUrl(null, 'wsrv')).toBe('')
  })

  it('wraps remote URLs in the wsrv proxy with width, quality and format', () => {
    const resolved = resolveCdnImageUrl(R2_URL, 'wsrv', { w: 800, q: 80, format: 'webp' })
    const params = new URL(resolved).searchParams
    expect(resolved.startsWith('https://wsrv.nl/?')).toBe(true)
    expect(params.get('url')).toBe(R2_URL)
    expect(params.get('w')).toBe('800')
    expect(params.get('q')).toBe('80')
    expect(params.get('output')).toBe('webp')
  })

  it('keeps SVG sources untouched in every mode', () => {
    const svg = 'https://pub-example.r2.dev/logos/band-mark.svg'
    expect(resolveCdnImageUrl(svg, 'wsrv', { w: 320 })).toBe(svg)
    vi.stubEnv('NEXT_PUBLIC_IMAGE_OPTIMIZATION', 'on')
    expect(resolveCdnImageUrl(svg, 'vercel', { w: 320 })).toBe(svg)
    expect(buildImageSrcSet(svg, 'wsrv', [320, 640])).toBeUndefined()
  })

  it('returns the origin URL in direct mode', () => {
    expect(resolveCdnImageUrl(R2_URL, 'direct', { w: 800 })).toBe(R2_URL)
  })

  it('uses /_next/image only when the optimizer flag is on and the host is allowed', () => {
    vi.stubEnv('NEXT_PUBLIC_IMAGE_OPTIMIZATION', 'on')
    const optimized = resolveCdnImageUrl(R2_URL, 'vercel', { w: 640, q: 75 })
    expect(optimized.startsWith('/_next/image?')).toBe(true)
    const params = new URLSearchParams(optimized.split('?')[1])
    expect(params.get('url')).toBe(R2_URL)
    expect(params.get('w')).toBe('640')
    expect(params.get('q')).toBe('75')
  })

  it('falls back to the origin URL in vercel mode while the flag is off', () => {
    vi.stubEnv('NEXT_PUBLIC_IMAGE_OPTIMIZATION', '')
    expect(resolveCdnImageUrl(R2_URL, 'vercel', { w: 640 })).toBe(R2_URL)
  })

  it('keeps unknown hosts on the origin URL even with the flag on', () => {
    vi.stubEnv('NEXT_PUBLIC_IMAGE_OPTIMIZATION', 'on')
    const unknown = 'https://drive.google.com/uc?id=123'
    expect(resolveCdnImageUrl(unknown, 'vercel', { w: 640 })).toBe(unknown)
  })
})

describe('isOptimizerAllowed', () => {
  it('allows configured CDN hosts and their subdomains', () => {
    expect(isOptimizerAllowed('https://is1-ssl.mzstatic.com/image/thumb/x/100x100bb.jpg')).toBe(true)
    expect(isOptimizerAllowed('https://wsrv.nl/?url=x')).toBe(true)
    expect(isOptimizerAllowed(R2_URL)).toBe(true)
    expect(isOptimizerAllowed('https://example.supabase.co/storage/v1/object/public/x.jpg')).toBe(true)
  })

  it('rejects unrelated hosts', () => {
    expect(isOptimizerAllowed('https://drive.google.com/file/d/1/view')).toBe(false)
    expect(isOptimizerAllowed('not-a-url')).toBe(false)
  })
})

describe('buildImageSrcSet', () => {
  it('builds width descriptors in wsrv mode', () => {
    const srcSet = buildImageSrcSet(R2_URL, 'wsrv', [480, 1200])
    expect(srcSet).toContain(' 480w')
    expect(srcSet).toContain(' 1200w')
    expect(srcSet?.split(', ')).toHaveLength(2)
  })

  it('returns undefined for relative URLs or empty width lists', () => {
    expect(buildImageSrcSet('/local.png', 'wsrv', [480])).toBeUndefined()
    expect(buildImageSrcSet(R2_URL, 'wsrv', [])).toBeUndefined()
  })
})

describe('largestWidth', () => {
  it('returns the biggest positive width', () => {
    expect(largestWidth([480, 1600, 768])).toBe(1600)
    expect(largestWidth([])).toBeUndefined()
  })
})
