/** Default hero wordmark bundled in /public. */
export const DEFAULT_HERO_LOGO_URL = '/brand/neuroklast-wordmark.svg'

export function resolveHeroLogoUrl(
  storagePath: string | null | undefined,
  fallbackUrl: string | null | undefined,
  resolve: (storage: string | null, url: string | null) => string | null,
): string {
  const resolved = resolve(storagePath ?? null, fallbackUrl ?? null)
  return resolved ?? DEFAULT_HERO_LOGO_URL
}