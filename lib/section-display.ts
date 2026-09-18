/** Default public headings when site_config.sections[].label is empty (English). */
export const SECTION_DEFAULT_HEADINGS: Record<string, string> = {
  hero: 'Hero',
  bio: 'Biography',
  credits: 'Credits & Partners',
  gallery: 'Gallery',
  media: 'Media',
  'music-highlights': 'Music Highlights',
  releases: 'Discography',
  merchandise: 'Merchandise',
  soundpacks: 'Soundpacks',
  gigs: 'Events',
  news: 'News',
  newsletter: 'Stay Connected',
  contact: 'Contact',
  spotify: 'Listen',
  social: 'Connect',
}

/** Extra English CMS / seed labels that still count as chrome (not a custom title). */
const SECTION_HEADING_ALIASES: Record<string, readonly string[]> = {
  bio: ['Bio'],
  credits: ['Credit Highlights', 'Credits'],
  releases: ['Releases'],
  soundpacks: ['Soundpacks & Presets'],
  gigs: ['Tour Dates', 'Upcoming Gigs', 'Gigs'],
  newsletter: ['Newsletter'],
  spotify: ['Spotify'],
}

/** i18n keys for public section titles (chrome). Custom admin labels are shown as-is. */
export const SECTION_TITLE_I18N_KEYS: Record<string, string> = {
  bio: 'section.bio',
  credits: 'section.credits',
  gallery: 'section.gallery',
  media: 'section.media',
  'music-highlights': 'section.musicHighlights',
  releases: 'section.releases',
  merchandise: 'section.merchandise',
  soundpacks: 'section.soundpacks',
  gigs: 'section.gigs',
  news: 'section.news',
  newsletter: 'section.newsletter',
  contact: 'section.contact',
  spotify: 'section.spotify',
  social: 'section.social',
}

function headingUpper(value: string, locale?: string): string {
  try {
    return locale ? value.toLocaleUpperCase(locale) : value.toLocaleUpperCase()
  } catch {
    return value.toUpperCase()
  }
}

export function formatSectionHeading(label: string | undefined, sectionId: string): string {
  const raw = label?.trim() || SECTION_DEFAULT_HEADINGS[sectionId] || sectionId
  return headingUpper(raw)
}

/**
 * Locale-aware section title for public chrome.
 * - Empty / English default label → translated section.* key
 * - Custom admin label → kept (CMS content, not chrome)
 */
function isDefaultHeading(sectionId: string, raw: string, locale?: string): boolean {
  const target = headingUpper(raw, locale)
  const candidates = [
    SECTION_DEFAULT_HEADINGS[sectionId],
    sectionId,
    ...(SECTION_HEADING_ALIASES[sectionId] ?? []),
  ].filter((value): value is string => Boolean(value))
  return candidates.some((candidate) => headingUpper(candidate, locale) === target)
}

export function resolveSectionHeading(
  label: string | undefined,
  sectionId: string,
  translate: (key: string) => string,
  locale?: string,
): string {
  const defaultEn = SECTION_DEFAULT_HEADINGS[sectionId] ?? sectionId
  const raw = label?.trim()
  if (!raw || isDefaultHeading(sectionId, raw, locale)) {
    const key = SECTION_TITLE_I18N_KEYS[sectionId]
    if (key) {
      const translated = translate(key)
      if (translated && translated !== key) return headingUpper(translated, locale)
    }
    return headingUpper(defaultEn, locale)
  }
  return headingUpper(raw, locale)
}
