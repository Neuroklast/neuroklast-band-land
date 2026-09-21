import { toDirectImageUrl } from '@/lib/image-cache'
import { innerUrlFromWsrv, parseHttpUrl } from '@/lib/r2-url-rewrite'

/**
 * Canonical, proxy-free media URL.
 *
 * Applies the site's external-URL rules (Google Drive / lh3 → direct host,
 * legacy Supabase Storage → `''`) and unwraps an existing wsrv.nl proxy so the
 * CDN resolver can re-apply whichever delivery mode is configured.
 *
 * Every image component must run its `src` through this first — otherwise
 * Drive-hosted artwork reaches the CDN as an unfetchable share link.
 */
export function canonicalImageUrl(src: string | null | undefined): string {
  const proxied = toDirectImageUrl(src)
  if (!proxied) return ''

  const parsed = parseHttpUrl(proxied)
  return (parsed ? innerUrlFromWsrv(parsed) : undefined) ?? proxied
}
