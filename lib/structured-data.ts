/**
 * Schema.org JSON-LD builders for the public site.
 *
 * Pure functions: no React, no Supabase, no network. Callers pass resolved
 * values, and builders return `null` when required fields are missing so a
 * broken entity is never emitted.
 */

export type JsonLdObject = Record<string, unknown>

export interface BreadcrumbItem {
  name: string
  /** Absolute http(s) URL of the breadcrumb target. */
  url: string
}

export interface MusicGroupInput {
  name: string
  url: string
  description?: string | null
  genres?: string[] | null
  imageUrl?: string | null
  logoUrl?: string | null
  sameAs?: string[] | null
}

export interface MusicEventInput {
  name: string
  /** ISO date (or date-time) from the gig row. */
  startDate: string
  url: string
  performerName: string
  venueName?: string | null
  city?: string | null
  country?: string | null
  description?: string | null
  ticketUrl?: string | null
  imageUrl?: string | null
  cancelled?: boolean
  soldOut?: boolean
}

const SCHEMA = 'https://schema.org'

/** Build an absolute URL from an origin plus a site-relative path. */
export function absoluteUrl(origin: string, pathOrUrl: string): string {
  const trimmed = (pathOrUrl ?? '').trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  const base = origin.replace(/\/+$/, '')
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return `${base}${path}`
}

/**
 * Serialize JSON-LD for inline embedding. `<` is escaped so a value can never
 * terminate the surrounding `<script>` element early.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

function cleanStrings(values: Array<string | null | undefined> | null | undefined): string[] {
  if (!Array.isArray(values)) return []
  return values
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
}

function uniqueHttpsUrls(values: Array<string | null | undefined> | null | undefined): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const value of cleanStrings(values)) {
    if (!/^https:\/\//i.test(value)) continue
    if (seen.has(value)) continue
    seen.add(value)
    result.push(value)
  }
  return result
}

function isHttpsUrl(value: string | null | undefined): value is string {
  return typeof value === 'string' && /^https:\/\//i.test(value.trim())
}

function buildPlace(input: MusicEventInput): JsonLdObject | null {
  const name = input.venueName?.trim()
  const city = input.city?.trim()
  const country = input.country?.trim()
  if (!name && !city) return null

  const place: JsonLdObject = { '@type': 'Place' }
  if (name) place.name = name
  if (city || country) {
    const address: JsonLdObject = { '@type': 'PostalAddress' }
    if (city) address.addressLocality = city
    if (country) address.addressCountry = country
    place.address = address
  }
  return place
}

/** MusicGroup entity for the artist (home page). */
export function buildMusicGroupSchema(input: MusicGroupInput): JsonLdObject | null {
  const name = input.name?.trim()
  const url = input.url?.trim()
  if (!name || !url) return null

  const schema: JsonLdObject = {
    '@context': SCHEMA,
    '@type': 'MusicGroup',
    name,
    url,
  }

  const description = input.description?.trim()
  if (description) schema.description = description

  const genres = cleanStrings(input.genres)
  if (genres.length > 0) schema.genre = genres

  const imageUrl = input.imageUrl?.trim()
  if (imageUrl) schema.image = imageUrl

  const logoUrl = input.logoUrl?.trim()
  if (logoUrl) schema.logo = logoUrl

  const sameAs = uniqueHttpsUrls(input.sameAs)
  if (sameAs.length > 0) schema.sameAs = sameAs

  return schema
}

/** WebSite entity (home page). */
export function buildWebSiteSchema(input: {
  name: string
  url: string
}): JsonLdObject | null {
  const name = input.name?.trim()
  const url = input.url?.trim()
  if (!name || !url) return null

  return {
    '@context': SCHEMA,
    '@type': 'WebSite',
    name,
    url,
  }
}

/** BreadcrumbList for a sub-page. Items must be ordered from root to current. */
export function buildBreadcrumbSchema(items: BreadcrumbItem[]): JsonLdObject | null {
  const cleaned = items
    .map((item) => ({ name: item.name?.trim() ?? '', url: item.url?.trim() ?? '' }))
    .filter((item) => item.name.length > 0 && /^https?:\/\//i.test(item.url))

  if (cleaned.length === 0) return null

  return {
    '@context': SCHEMA,
    '@type': 'BreadcrumbList',
    itemListElement: cleaned.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/** MusicEvent entity for a single gig. */
export function buildMusicEventSchema(input: MusicEventInput): JsonLdObject | null {
  const name = input.name?.trim()
  const startDate = input.startDate?.trim()
  const performerName = input.performerName?.trim()
  if (!name || !startDate || !performerName) return null

  const schema: JsonLdObject = {
    '@context': SCHEMA,
    '@type': 'MusicEvent',
    name,
    startDate,
    eventStatus: input.cancelled
      ? `${SCHEMA}/EventCancelled`
      : `${SCHEMA}/EventScheduled`,
    eventAttendanceMode: `${SCHEMA}/OfflineEventAttendanceMode`,
    performer: { '@type': 'MusicGroup', name: performerName },
  }

  const url = input.url?.trim()
  if (url) schema.url = url

  const description = input.description?.trim()
  if (description) schema.description = description

  const location = buildPlace(input)
  if (location) schema.location = location

  const imageUrl = input.imageUrl?.trim()
  if (imageUrl) schema.image = imageUrl

  if (isHttpsUrl(input.ticketUrl)) {
    schema.offers = {
      '@type': 'Offer',
      url: input.ticketUrl.trim(),
      availability: input.soldOut ? `${SCHEMA}/SoldOut` : `${SCHEMA}/InStock`,
    }
  }

  return schema
}
