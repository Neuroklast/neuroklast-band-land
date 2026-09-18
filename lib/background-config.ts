import { r2Url } from '@/lib/r2'

export type MobileVideoMode = 'same' | 'separate' | 'off'

export const HERO_BACKGROUND_VIDEO_OPACITY = 0.5
export const DEFAULT_BACKGROUND_VIDEO_OPACITY = 0.3
export const DEFAULT_SITE_BACKGROUND_VIDEO = '/brand/websitebg.scrub.mp4'

function isBundledPublicPath(value: string): boolean {
  return value.startsWith('/brand/') || value.startsWith('/assets/')
}

export function backgroundVideoDimOpacity(
  videoOpacity = DEFAULT_BACKGROUND_VIDEO_OPACITY,
): number {
  return Math.max(0, Math.min(1, 1 - videoOpacity))
}

export function backgroundVideoOpacityForScroll(
  scrollY: number,
  viewportHeight: number,
): number {
  const span = Math.max(1, viewportHeight)
  const t = Math.min(1, Math.max(0, scrollY / span))
  return (
    HERO_BACKGROUND_VIDEO_OPACITY +
    (DEFAULT_BACKGROUND_VIDEO_OPACITY - HERO_BACKGROUND_VIDEO_OPACITY) * t
  )
}

export function parseMobileVideoMode(raw: unknown): MobileVideoMode {
  if (raw === 'separate' || raw === 'off') return raw
  return 'same'
}

/**
 * Explicit master switch for background video.
 * When key is missing: enabled if a video URL/path is configured (back-compat).
 */
export function parseBackgroundVideoEnabled(
  raw: unknown,
  hasConfiguredVideo: boolean,
): boolean {
  if (typeof raw === 'boolean') return raw
  return hasConfiguredVideo
}

export function parseBackgroundVideoOpacity(
  raw: unknown,
  fallback = DEFAULT_BACKGROUND_VIDEO_OPACITY,
): number {
  if (typeof raw !== 'number' || Number.isNaN(raw)) return fallback
  return Math.max(0, Math.min(1, raw))
}

/** Pick which background video URL to play for the current viewport. */
export function resolveActiveBackgroundVideoUrl(
  desktopUrl: string | undefined,
  mobileUrl: string | undefined,
  mobileMode: MobileVideoMode,
  isMobile: boolean,
  videoEnabled = true,
): string | undefined {
  if (!videoEnabled) return undefined
  if (!desktopUrl && !mobileUrl) return undefined

  if (isMobile) {
    if (mobileMode === 'off') return undefined
    if (mobileMode === 'separate' && mobileUrl) return mobileUrl
  }

  return desktopUrl
}

/**
 * Public scroll-video URL from site_config.background.
 * Storage path (R2) wins; then absolute / bundled `/brand` URLs; else undefined
 * so callers can fall back to DEFAULT_SITE_BACKGROUND_VIDEO.
 */
export function resolveSiteBackgroundVideoSrc(
  storagePath: unknown,
  fallbackUrl: unknown,
): string | undefined {
  if (typeof storagePath === 'string' && storagePath.trim()) {
    const fromPath = r2Url(storagePath.trim())
    if (fromPath) return fromPath
  }
  if (typeof fallbackUrl === 'string' && fallbackUrl.trim()) {
    const trimmed = fallbackUrl.trim()
    if (isBundledPublicPath(trimmed)) return trimmed
    if (/^(https?:)?\/\//i.test(trimmed)) return trimmed
  }
  return undefined
}