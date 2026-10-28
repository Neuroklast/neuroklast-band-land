import { resolveImageUrl } from '@/lib/r2'
import { currentR2PublicOrigin } from '@/lib/r2-url-rewrite'

/** Resolve only the configured public R2 host; never fetch arbitrary CMS URLs. */
export function newsR2SocialSource(
  storagePath: string | null | undefined,
  coverUrl: string | null | undefined,
): URL | null {
  const image = resolveImageUrl(storagePath, coverUrl)
  const origin = currentR2PublicOrigin()
  if (!image || !origin) return null
  try {
    const url = new URL(image)
    if (url.protocol !== 'https:' || url.username || url.password ||
      url.origin !== new URL(origin).origin) return null
    if (!url.pathname || url.pathname === '/' || url.pathname.includes('..')) return null
    return url
  } catch {
    return null
  }
}

export function newsSocialImagePath(slug: string, coverSource: URL): string {
  // R2 keys are content-addressed; changes to an image produce a fresh share URL.
  const version = coverSource.pathname.split('/').pop() || 'cover'
  return '/news/' + encodeURIComponent(slug) + '/social-image?v=' + encodeURIComponent(version)
}

export function newsSocialImageMetadata(
  slug: string,
  title: string,
  storagePath: string | null | undefined,
  coverUrl: string | null | undefined,
  siteOrigin: string,
): {
  image: string
  openGraphImage: { url: string; alt: string; width?: number; height?: number; type?: string }
} {
  const cover = newsR2SocialSource(storagePath, coverUrl)
  if (!cover) {
    const image = siteOrigin.replace(/\/+$/, '') + '/og-image.png'
    return { image, openGraphImage: { url: image, alt: title } }
  }
  const image = siteOrigin.replace(/\/+$/, '') + newsSocialImagePath(slug, cover)
  return {
    image,
    openGraphImage: {
      url: image,
      alt: title,
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  }
}
