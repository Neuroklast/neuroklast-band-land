import type { Gig } from '@/lib/app-types'
import { normalizeGigStatus, isSoldOutStatus } from '@/lib/gig-status'
import { resolveImageUrl } from '@/lib/r2'

export const GIG_PUBLIC_COLUMNS =
  'id, title, venue, city, country, event_date, ticket_url, festival_name, description, gig_type, status, sold_out, photo_storage_path, photo_url, event_links'

export const GIG_TYPE_OPTIONS = [
  { value: 'gig', label: 'Gig' },
  { value: 'dj', label: 'DJ set' },
  { value: 'concert', label: 'Concert' },
  { value: 'festival', label: 'Festival' },
] as const

export type GigTypeValue = (typeof GIG_TYPE_OPTIONS)[number]['value']

export interface PublicGigRow {
  id: string
  title: string
  venue: string | null
  city: string | null
  country: string | null
  event_date: string
  ticket_url: string | null
  festival_name: string | null
  description?: string | null
  gig_type?: string | null
  status?: string | null
  sold_out?: boolean | null
  photo_storage_path?: string | null
  photo_url?: string | null
  event_links?: Record<string, unknown> | null
}

/** Public headline: event name, never the club. Festival column is a legacy alias. */
export function eventDisplayName(row: Pick<PublicGigRow, 'title' | 'festival_name' | 'venue'>): string {
  const title = row.title?.trim() ?? ''
  const festival = row.festival_name?.trim() ?? ''
  const venue = row.venue?.trim() ?? ''
  if (festival && title && venue && title.toLowerCase() === venue.toLowerCase()) return festival
  return title || festival
}

function cityCountry(row: Pick<PublicGigRow, 'city' | 'country'>): string {
  return [row.city?.trim(), row.country?.trim()].filter(Boolean).join(', ')
}

/** Club + address as one OSM-friendly line. Skips city/country if already inside venue. */
export function formatGigLocation(
  row: Pick<PublicGigRow, 'venue' | 'city' | 'country'>,
): string {
  const venue = row.venue?.trim() ?? ''
  const place = cityCountry(row)
  if (!venue) return place
  if (!place) return venue
  const haystack = venue.toLowerCase()
  if (haystack.includes(place.toLowerCase())) return venue
  if (row.city?.trim() && haystack.includes(row.city.trim().toLowerCase())) return venue
  return `${venue}, ${place}`
}

export function gigHasClockTime(iso: string): boolean {
  const match = iso.match(/T(\d{2}):(\d{2})/)
  if (!match) return false
  return match[1] !== '00' || match[2] !== '00'
}

export function gigTypeLabel(value: string | null | undefined): string | undefined {
  if (!value?.trim()) return undefined
  const found = GIG_TYPE_OPTIONS.find((option) => option.value === value)
  return found?.label ?? value
}

export function eventPageUrlFromLinks(
  links: Record<string, unknown> | null | undefined,
): string | undefined {
  if (!links) return undefined
  for (const key of ['page', 'website', 'url', 'event']) {
    const value = links[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return undefined
}

export function osmSearchUrl(query: string): string {
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`
}

/** Map a Supabase gig row to the overlay `Gig` shape used by CyberpunkOverlay. */
export function mapGigRowToOverlayGig(row: PublicGigRow): Gig {
  const eventName = eventDisplayName(row)
  const location = formatGigLocation(row)
  const venue = row.venue?.trim() || location || eventName

  return {
    id: row.id,
    title: eventName,
    venue,
    location: location || venue,
    date: row.event_date,
    ticketUrl: row.ticket_url ?? undefined,
    description: row.description?.trim() || undefined,
    startsAt: gigHasClockTime(row.event_date) ? row.event_date : undefined,
    gigType: gigTypeLabel(row.gig_type),
    status: normalizeGigStatus(row.status),
    soldOut: row.sold_out === true || isSoldOutStatus(row.status),
    photoUrl: resolveImageUrl(row.photo_storage_path, row.photo_url) ?? undefined,
    eventUrl: eventPageUrlFromLinks(row.event_links),
  }
}