/**
 * Image CDN resolver.
 *
 * One pure entry point decides how a remote image URL is delivered:
 *   - `wsrv`   → wsrv.nl proxy (default; free, resizes + converts to WebP)
 *   - `vercel` → Vercel Image Optimization (`/_next/image`, needs quota + the
 *                `NEXT_PUBLIC_IMAGE_OPTIMIZATION=on` deploy flag)
 *   - `direct` → the raw origin URL
 *
 * Relative URLs, data URLs and empty values always pass through unchanged.
 */

export type ImageCdnMode = 'wsrv' | 'vercel' | 'direct'

export const IMAGE_CDN_MODES: readonly ImageCdnMode[] = ['wsrv', 'vercel', 'direct']

export const DEFAULT_IMAGE_CDN_MODE: ImageCdnMode = 'wsrv'

export interface ImageTransformOptions {
  /** Target width in CSS pixels. */
  w?: number
  /** Target height in CSS pixels. */
  h?: number
  /** Quality 1-100 (wsrv + Vercel). */
  q?: number
  /** Output format for the wsrv proxy. */
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
}

/** Hosts allowed through Vercel's optimizer (mirrors next.config.mjs remotePatterns). */
const STATIC_OPTIMIZER_HOSTS = [
  'images.unsplash.com',
  'mzstatic.com',
  'img.youtube.com',
  'bcbits.com',
  'wsrv.nl',
  'r2.dev',
  'r2.cloudflarestorage.com',
]

function normalizeHostname(value: string | undefined | null): string | null {
  if (!value) return null
  try {
    return new URL(value.startsWith('http') ? value : `https://${value}`).hostname.toLowerCase()
  } catch {
    return null
  }
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return null
  }
}

function matchesHost(hostname: string, allowed: string): boolean {
  return hostname === allowed || hostname.endsWith(`.${allowed}`)
}

/**
 * Vercel's optimizer only accepts hosts listed in `images.remotePatterns`.
 * Unknown hosts would return 400, so they stay on their original URL.
 */
export function isOptimizerAllowed(url: string, extraHosts: Array<string | null | undefined> = []): boolean {
  const hostname = hostnameOf(url)
  if (!hostname) return false

  const r2Host = normalizeHostname(process.env.NEXT_PUBLIC_R2_PUBLIC_HOST)
  const allowed = [
    ...STATIC_OPTIMIZER_HOSTS,
    ...extraHosts.map((host) => normalizeHostname(host)),
    r2Host,
  ].filter((host): host is string => Boolean(host))

  if (allowed.some((host) => matchesHost(hostname, host))) return true
  // Supabase storage is not used for media any more, but legacy rows may still point there.
  return hostname.endsWith('.supabase.co')
}

/** True when the deployment enabled Vercel image optimization. */
export function isVercelOptimizerEnabled(): boolean {
  return process.env.NEXT_PUBLIC_IMAGE_OPTIMIZATION === 'on'
}

export function parseImageCdnMode(value: unknown): ImageCdnMode {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const mode = (value as Record<string, unknown>).mode
    if (typeof mode === 'string' && (IMAGE_CDN_MODES as readonly string[]).includes(mode)) {
      return mode as ImageCdnMode
    }
  }
  return DEFAULT_IMAGE_CDN_MODE
}

function isTransformable(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

/**
 * SVG sources stay untouched: rasterizing a vector logo through a resizer loses
 * quality (and some proxies reject it). Vector art is already tiny.
 */
export function isSvgUrl(url: string): boolean {
  try {
    return new URL(url).pathname.toLowerCase().endsWith('.svg')
  } catch {
    return /\.svg(\?|#|$)/i.test(url)
  }
}

export function resolveCdnImageUrl(
  rawUrl: string | null | undefined,
  mode: ImageCdnMode,
  options: ImageTransformOptions = {},
): string {
  const url = (rawUrl ?? '').trim()
  if (!url || !isTransformable(url)) return url
  if (isSvgUrl(url)) return url

  const { w, h, q = 80, format } = options

  if (mode === 'wsrv') {
    const params = new URLSearchParams()
    params.set('url', url)
    if (w && w > 0) params.set('w', String(Math.round(w)))
    if (h && h > 0) params.set('h', String(Math.round(h)))
    if (q && q > 0) params.set('q', String(Math.round(q)))
    params.set('output', format ?? 'webp')
    return `https://wsrv.nl/?${params.toString()}`
  }

  if (mode === 'vercel' && w && w > 0 && isVercelOptimizerEnabled() && isOptimizerAllowed(url)) {
    const params = new URLSearchParams()
    params.set('url', url)
    params.set('w', String(Math.round(w)))
    if (q && q > 0) params.set('q', String(Math.round(q)))
    return `/_next/image?${params.toString()}`
  }

  return url
}

/** Build a `srcset` string for the given widths, or `undefined` when not applicable. */
export function buildImageSrcSet(
  rawUrl: string | null | undefined,
  mode: ImageCdnMode,
  widths: number[],
  options: Omit<ImageTransformOptions, 'w'> = {},
): string | undefined {
  const url = (rawUrl ?? '').trim()
  if (!url || !isTransformable(url) || isSvgUrl(url) || widths.length === 0) return undefined

  const entries = widths
    .filter((width) => Number.isFinite(width) && width > 0)
    .map((width) => `${resolveCdnImageUrl(url, mode, { ...options, w: width })} ${Math.round(width)}w`)

  return entries.length > 0 ? entries.join(', ') : undefined
}

/** Largest width in a srcset list — used as the plain `src` fallback. */
export function largestWidth(widths: number[]): number | undefined {
  const valid = widths.filter((width) => Number.isFinite(width) && width > 0)
  return valid.length > 0 ? Math.max(...valid) : undefined
}
