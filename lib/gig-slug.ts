import { eventDisplayName, type PublicGigRow } from '@/lib/gig-public-mapper'

/**
 * Stable, human-readable slugs for gig detail pages.
 *
 * Shape: `<event-name>-<YYYY-MM-DD>` with `-<city>` appended on collisions and a
 * numeric suffix as the last resort. Pure functions — the same input always
 * yields the same slug, so `generateStaticParams` and link building agree.
 */

const UMLAUT_MAP: Record<string, string> = {
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  ß: 'ss',
  å: 'aa',
  æ: 'ae',
  ø: 'oe',
  é: 'e',
  è: 'e',
  ê: 'e',
  á: 'a',
  à: 'a',
  â: 'a',
  í: 'i',
  ì: 'i',
  î: 'i',
  ó: 'o',
  ò: 'o',
  ô: 'o',
  ú: 'u',
  ù: 'u',
  û: 'u',
  ç: 'c',
  ñ: 'n',
}

export function slugifyGigPart(value: string | null | undefined): string {
  const input = (value ?? '').trim().toLowerCase()
  if (!input) return ''

  const transliterated = input.replace(/[äöüßåæøéèêáàâíìîóòôúùûçñ]/g, (char) => UMLAUT_MAP[char] ?? char)

  return transliterated
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function gigDatePart(row: Pick<PublicGigRow, 'event_date'>): string {
  const match = (row.event_date ?? '').match(/^(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : 'undated'
}

type GigSlugInput = Pick<
  PublicGigRow,
  'id' | 'title' | 'festival_name' | 'venue' | 'city' | 'event_date'
>

/** Base slug without collision handling. */
export function buildGigSlugBase(row: GigSlugInput): string {
  const name = slugifyGigPart(eventDisplayName(row)) || slugifyGigPart(row.venue) || 'event'
  return `${name}-${gigDatePart(row)}`
}

/**
 * Deterministic slug map for a list of gigs. `Map<gigId, slug>`.
 * Collisions get the city appended, then a numeric suffix.
 */
export function buildGigSlugMap(rows: GigSlugInput[]): Map<string, string> {
  const sorted = [...rows].sort((a, b) => a.id.localeCompare(b.id))

  // Count base slugs first: every member of a colliding group gets the city
  // suffix, so adding a later event never rewrites an existing URL.
  const baseCounts = new Map<string, number>()
  for (const row of sorted) {
    const base = buildGigSlugBase(row)
    baseCounts.set(base, (baseCounts.get(base) ?? 0) + 1)
  }

  const taken = new Set<string>()
  const result = new Map<string, string>()

  for (const row of sorted) {
    const base = buildGigSlugBase(row)
    const city = slugifyGigPart(row.city)
    const collides = (baseCounts.get(base) ?? 0) > 1
    let slug = collides && city ? `${base}-${city}` : base

    if (taken.has(slug)) {
      let counter = 2
      while (taken.has(`${slug}-${counter}`)) counter += 1
      slug = `${slug}-${counter}`
    }

    taken.add(slug)
    result.set(row.id, slug)
  }

  return result
}

/** Resolve a slug back to a gig row. */
export function findGigBySlug<T extends GigSlugInput>(rows: T[], slug: string): T | null {
  const map = buildGigSlugMap(rows)
  for (const row of rows) {
    if (map.get(row.id) === slug) return row
  }
  return null
}
