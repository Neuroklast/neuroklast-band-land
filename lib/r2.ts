import { canonicalizeR2MediaUrl, currentR2PublicOrigin } from '@/lib/r2-url-rewrite'

/**
 * Builds a public Cloudflare R2 URL from a storage object path.
 * Falls back to null when R2_PUBLIC_HOST is not configured.
 */
export function r2Url(storagePath: string | null | undefined): string | null {
  if (!storagePath) return null
  const origin = currentR2PublicOrigin()
  if (!origin) return null
  return `${origin}/${storagePath.replace(/^\/+/, '')}`
}

/**
 * Resolves the best available public URL for a record that has both
 * a storage path (R2) and a legacy fallback URL.
 *
 * Fallback URLs that still point at an old `*.r2.dev` host (or a wsrv.nl
 * wrapper of one) are rebuilt onto the current `R2_PUBLIC_HOST`.
 */
/** R2 URL, or a site-bundled `/brand` `/assets` path (root-relative, safe as img src). */
export function resolvePublicAssetUrl(
  storagePath: string | null | undefined,
  fallbackUrl: string | null | undefined,
): string | null {
  const fromR2 = resolveImageUrl(storagePath, fallbackUrl)
  if (fromR2) return fromR2
  if (typeof fallbackUrl !== 'string') return null
  const trimmed = fallbackUrl.trim()
  if (trimmed.startsWith('/brand/') || trimmed.startsWith('/assets/')) return trimmed
  return null
}

export function resolveImageUrl(
  storagePath: string | null | undefined,
  fallbackUrl: string | null | undefined,
): string | null {
  const fromPath = r2Url(storagePath)
  if (fromPath) return fromPath
  if (!fallbackUrl) return null

  // Ignore bare relative paths — a relative `src` resolves against the current
  // route and yields a broken image, never a working cover.
  const trimmed = fallbackUrl.trim()
  if (!/^(https?:)?\/\//i.test(trimmed) && !trimmed.startsWith('data:')) return null

  // Policy: media is ALWAYS served from Cloudflare R2, never from Supabase
  // Storage. A legacy `*.supabase.co` URL is invalid — return null so nothing
  // renders from Supabase. The deploy migration (lib/legacy-url-migration-on-deploy)
  // clears these rows; the admin badge (lib/legacy-url-audit) reports them.
  if (isLegacySupabaseStorageUrl(trimmed)) return null

  return canonicalizeR2MediaUrl(trimmed)
}

/**
 * True when a URL still targets the legacy Supabase Storage host.
 * Such URLs move egress onto Supabase; they must never be used as a direct
 * browser `href`/`src` (see lib/crawler-blocklist + ADMIN_GUIDE egress chapter).
 */
export function isLegacySupabaseStorageUrl(url: string | null | undefined): boolean {
  if (!url) return false
  try {
    return new URL(url).hostname.endsWith('.supabase.co')
  } catch {
    return false
  }
}
