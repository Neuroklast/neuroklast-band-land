import {
  DEFAULT_SECTIONS,
  type SectionConfig,
  parseSections,
  withoutExcludedSections,
} from '@/lib/site-config-sections'

export interface NavLink {
  sectionId: string
  href: string
  label: string
}

/** Section config ids that never appear in the main nav (no scroll target or hero). */
export const NAV_EXCLUDED_SECTION_IDS = new Set(['hero', 'social', 'connect', 'spotify'])

/** Maps site_config section id → public DOM anchor id. */
export const SECTION_ANCHOR_BY_ID: Record<string, string> = {
  bio: 'bio',
  credits: 'credits',
  gallery: 'gallery',
  media: 'media',
  'music-highlights': 'music',
  releases: 'releases',
  merchandise: 'merch',
  soundpacks: 'soundpacks',
  gigs: 'gigs',
  news: 'news',
  newsletter: 'newsletter',
  contact: 'contact',
}

const NAV_DEFAULT_LABELS: Record<string, string> = {
  bio: 'Biography',
  credits: 'Credits',
  gallery: 'Gallery',
  media: 'Media',
  'music-highlights': 'Music',
  releases: 'Releases',
  merchandise: 'Merch',
  soundpacks: 'Soundpacks',
  gigs: 'Gigs',
  news: 'News',
  newsletter: 'Newsletter',
  contact: 'Contact',
}

/** Live neuroklast.net nav (Classic HUD) — not the Zardonic/CMS mega-menu. */
export const NEUROKLAST_NAV_SECTION_IDS = [
  'news',
  'bio',
  'gallery',
  'gigs',
  'releases',
  'media',
  'contact',
] as const

/** Homepage sections = hero + navbar targets, same order as the HUD. */
export const NEUROKLAST_HOME_SECTION_IDS = ['hero', ...NEUROKLAST_NAV_SECTION_IDS] as const

const HOME_ORDER = new Map(
  NEUROKLAST_HOME_SECTION_IDS.map((id, index) => [id, index]),
)

export function filterHomeSectionsToNav(sections: SectionConfig[]): SectionConfig[] {
  const allowed = new Set<string>(NEUROKLAST_HOME_SECTION_IDS)
  return sections
    .filter((section) => allowed.has(section.id))
    .sort((a, b) => (HOME_ORDER.get(a.id) ?? 99) - (HOME_ORDER.get(b.id) ?? 99))
}

/**
 * Compact labels for the top nav only.
 * Full section titles (e.g. "Biography", "Discography") stay on the page headings;
 * long titles were clipping under the logo ("…ography").
 */
export function resolveNavLabel(section: Pick<SectionConfig, 'id' | 'label'>): string {
  return NAV_DEFAULT_LABELS[section.id] ?? section.label?.trim() ?? section.id
}

export function buildNavLinks(sections: SectionConfig[]): NavLink[] {
  return [...sections]
    .sort((a, b) => a.order - b.order)
    .filter(
      (section) =>
        section.visible &&
        !NAV_EXCLUDED_SECTION_IDS.has(section.id) &&
        SECTION_ANCHOR_BY_ID[section.id] != null,
    )
    .map((section) => ({
      sectionId: section.id,
      href: `#${SECTION_ANCHOR_BY_ID[section.id]}`,
      label: resolveNavLabel(section),
    }))
}

/** Seven Classic HUD items matching neuroklast.net, in live order. */
export function buildNeuroklastNavItems(
  sections?: SectionConfig[],
): Array<{ id: string; label: string }> {
  const visible = new Set(
    (sections ?? DEFAULT_SECTIONS)
      .filter((section) => section.visible)
      .map((section) => section.id),
  )
  return NEUROKLAST_NAV_SECTION_IDS.filter((id) => visible.has(id)).map((id) => ({
    id: SECTION_ANCHOR_BY_ID[id] ?? id,
    label: NAV_DEFAULT_LABELS[id] ?? id,
  }))
}

export function buildNavLinksFromConfig(raw: unknown): NavLink[] {
  return buildNavLinks(withoutExcludedSections(parseSections(raw)))
}

export function defaultNavLinks(): NavLink[] {
  return buildNavLinks(withoutExcludedSections(DEFAULT_SECTIONS))
}