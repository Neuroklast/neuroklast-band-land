export interface AdminNavItemData {
  href: string
  label: string
  /** If true, only exact pathname match counts as active */
  exact?: boolean
  /** Dashboard count key (optional) */
  countKey?: string
}

export interface AdminNavGroupData {
  id: string
  label: string
  items: AdminNavItemData[]
}

/**
 * One canonical list for sidebar, active-route matching and admin help.
 * Keep every existing href represented exactly once when reorganising groups.
 */
export const ADMIN_NAV_GROUPS: AdminNavGroupData[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [{ href: '/admin', label: 'Dashboard', exact: true }],
  },
  {
    id: 'site',
    label: 'Website & Legal',
    items: [
      { href: '/admin/site-config', label: 'Look & Feel' },
      { href: '/admin/legal', label: 'Legal & Privacy' },
      { href: '/admin/privacy', label: 'Privacy Requests & Export' },
      { href: '/admin/translations', label: 'Translations' },
    ],
  },
  {
    id: 'artist',
    label: 'Band',
    items: [
      { href: '/admin/bio', label: 'Biography' },
      { href: '/admin/members', label: 'Members', countKey: 'members' },
      { href: '/admin/partners', label: 'Credits & Partners', countKey: 'partners' },
      { href: '/admin/social', label: 'Social Links', countKey: 'social' },
    ],
  },
  {
    id: 'content',
    label: 'Music & Content',
    items: [
      { href: '/admin/releases', label: 'Discography', countKey: 'releases' },
      { href: '/admin/gigs', label: 'Events', countKey: 'gigs' },
      { href: '/admin/news', label: 'News / Blog', countKey: 'news' },
      { href: '/admin/gallery', label: 'Gallery', countKey: 'gallery' },
      { href: '/admin/media', label: 'Media Downloads', countKey: 'media' },
      { href: '/admin/music-highlights', label: 'Music Highlights', countKey: 'musicHighlights' },
    ],
  },
  {
    id: 'shop',
    label: 'Shop & Sales',
    items: [
      { href: '/admin/merchandise', label: 'Merchandise', countKey: 'merchandise' },
      { href: '/admin/plugins', label: 'Products & Plugins', countKey: 'products' },
      { href: '/admin/soundpacks', label: 'Soundpacks', countKey: 'soundpacks' },
      { href: '/admin/orders', label: 'Plugin Orders' },
    ],
  },
  {
    id: 'support',
    label: 'Customer Support',
    items: [
      { href: '/admin/contact-inbox', label: 'Contact Inbox' },
      { href: '/admin/contact-spam', label: 'Contact Spam Filter' },
      { href: '/admin/withdrawals', label: 'Withdrawal Confirmations' },
    ],
  },
  {
    id: 'ai',
    label: 'AI & Integrations',
    items: [
      { href: '/admin/ai-content', label: 'Content Review' },
      { href: '/admin/integrations', label: 'Integrations' },
    ],
  },
  {
    id: 'system',
    label: 'System & Data',
    items: [
      { href: '/admin/releases/sync', label: 'Catalogue Sync' },
      { href: '/admin/analytics', label: 'Analytics' },
      { href: '/admin/api-keys', label: 'API Keys' },
      { href: '/admin/security', label: 'Security' },
      { href: '/admin/health', label: 'API Health' },
      { href: '/admin/data', label: 'Data Import/Export' },
    ],
  },
]

export const ADMIN_NAV_ITEMS: AdminNavItemData[] = ADMIN_NAV_GROUPS.flatMap((g) => g.items)

export function resolveActiveNavItem(pathname: string): AdminNavItemData | null {
  let best: AdminNavItemData | null = null
  let bestLen = -1

  for (const item of ADMIN_NAV_ITEMS) {
    const matches = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
    if (!matches) continue
    if (item.href.length > bestLen) {
      best = item
      bestLen = item.href.length
    }
  }

  return best
}

export function isNavItemActive(pathname: string, item: AdminNavItemData): boolean {
  const active = resolveActiveNavItem(pathname)
  return active?.href === item.href
}

/** Keeps the active page visible when its parent section is collapsed by default. */
export function resolveActiveNavGroupId(pathname: string): string | null {
  const active = resolveActiveNavItem(pathname)
  if (!active) return null
  return ADMIN_NAV_GROUPS.find((group) => group.items.some((item) => item.href === active.href))?.id ?? null
}
