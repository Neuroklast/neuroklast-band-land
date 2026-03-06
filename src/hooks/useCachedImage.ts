import { useState, useEffect } from 'react'
import { loadCachedImage, toDirectImageUrl } from '@/lib/image-cache'

/**
 * Returns true for local/bundled assets that don't need external caching or proxying.
 * Covers relative paths, absolute paths served from the same origin, data URIs,
 * and blob URIs.
 */
function isLocalUrl(url: string): boolean {
  return (
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('/') ||
    url.startsWith('./') ||
    url.startsWith('../') ||
    !url.includes('://')
  )
}

/**
 * Hook that loads an image URL through the client-side caching system
 * (IndexedDB + wsrv.nl proxy for Google Drive URLs).
 *
 * - Bundled/local assets (relative URLs, absolute same-origin paths, data URIs)
 *   are returned as-is without going through the proxy or cache.
 * - External URLs are loaded via `loadCachedImage()`, which handles IndexedDB
 *   caching, wsrv.nl proxy for Google Drive, and server-side `/api/image-proxy`
 *   fallback. While loading, the wsrv.nl-transformed URL is used as an immediate
 *   fallback so images are never shown as raw Google Drive URLs.
 *
 * @param url - The raw image URL (may be a Google Drive link, any external URL,
 *              a relative path, or undefined/empty).
 * @returns The best available URL: a cached data URL, the wsrv.nl-proxied URL,
 *          or the original URL for local assets.
 */
export function useCachedImage(url: string | undefined): string {
  // Store both the source URL and the resolved cached result together so that
  // stale results from a previous URL are never used for the current URL.
  const [cached, setCached] = useState<{ url: string; result: string } | null>(null)

  useEffect(() => {
    if (!url || isLocalUrl(url)) return

    let cancelled = false
    loadCachedImage(url).then(result => {
      if (!cancelled) setCached({ url, result })
    })
    return () => {
      cancelled = true
    }
  }, [url])

  if (!url) return ''
  if (isLocalUrl(url)) return url
  // Use cached data URL only if it matches the current URL; otherwise fall back
  // to the wsrv.nl-proxied URL while the async load is in progress.
  if (cached?.url === url) return cached.result
  return toDirectImageUrl(url)
}

