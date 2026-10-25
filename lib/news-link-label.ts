/** Per-news link labels live in the existing site_config JSON row (no schema migration). */
export const NEWS_LINK_LABELS_KEY = 'news_link_labels'

/** Keep user-entered CTA copy brief enough for narrow cards. */
export function cleanNewsLinkLabel(value: unknown): string | null {
  return typeof value === 'string' && value.trim()
    ? value.trim().replace(/\s+/g, ' ').slice(0, 36)
    : null
}

export function parseNewsLinkLabels(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const result: Record<string, string> = {}
  for (const [id, raw] of Object.entries(value)) {
    if (!/^[a-f\d-]{36}$/i.test(id)) continue
    const label = cleanNewsLinkLabel(raw)
    if (label) result[id] = label
  }
  return result
}

/** Useful labels without an admin override. No remote requests or guessed prices. */
export function resolveNewsLinkLabel(href: string, customLabel?: string | null): string {
  const configured = cleanNewsLinkLabel(customLabel)
  if (configured) return configured
  try {
    const url = new URL(href)
    const host = url.hostname.toLowerCase()
    const path = url.pathname.toLowerCase()
    if (host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtu.be' || host === 'vimeo.com') return 'WATCH VIDEO'
    if (host === 'spotify.com' || host.endsWith('.spotify.com') || host === 'soundcloud.com' || host.endsWith('.bandcamp.com') || host === 'music.apple.com') return 'LISTEN'
    if (path.includes('download')) return 'DOWNLOAD'
    if (path.startsWith('/plugins/')) return 'VIEW PLUGIN'
    if (/shop|store|merch/.test(host) || path.startsWith('/shop')) return 'VISIT SHOP'
  } catch {
    // The external URL is separately validated; do not render invalid links.
  }
  return 'OPEN LINK'
}
