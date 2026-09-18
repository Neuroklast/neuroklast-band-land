/**
 * Canonical gig status + derived public badge state.
 *
 * Stored `gigs.status` is free text. The admin form and legacy rows used the
 * one-L spelling `canceled`; the public UI standardizes on `cancelled`.
 * "Sold out" is an independent boolean flag so it can coexist with a lifecycle
 * status, and "live" is derived from the event date/time.
 */

export type GigStatusValue = 'confirmed' | 'announced' | 'cancelled'

export type GigStatusKind = 'cancelled' | 'soldout' | 'live' | 'announced' | 'confirmed'

/** How long after the start an event still counts as happening. */
export const GIG_LIVE_WINDOW_MS = 6 * 60 * 60 * 1000

/** A gig counts as live shortly before its start (doors / warm-up). */
export const GIG_LIVE_LEAD_MS = 60 * 60 * 1000

export function normalizeGigStatus(raw: string | null | undefined): GigStatusValue {
  const value = raw?.trim().toLowerCase() ?? ''
  if (value === 'cancelled' || value === 'canceled') return 'cancelled'
  if (value === 'announced') return 'announced'
  return 'confirmed'
}

/** Legacy rows stored "soldout" as a status value. */
export function isSoldOutStatus(raw: string | null | undefined): boolean {
  const value = raw?.trim().toLowerCase() ?? ''
  return value === 'soldout' || value === 'sold_out' || value === 'sold out'
}

function hasClockTime(iso: string): boolean {
  const match = iso.match(/T(\d{2}):(\d{2})/)
  return Boolean(match) && (match![1] !== '00' || match![2] !== '00')
}

export function isGigLive(options: {
  eventDate: string
  startsAt?: string | null
  now: Date
}): boolean {
  const { eventDate, startsAt, now } = options
  const source = startsAt && hasClockTime(startsAt) ? startsAt : eventDate
  const start = new Date(source)
  if (Number.isNaN(start.getTime())) return false

  if (!hasClockTime(source)) {
    // Whole-day event: live throughout its calendar day (UTC-stable).
    return source.slice(0, 10) === now.toISOString().slice(0, 10)
  }

  const startMs = start.getTime()
  return now.getTime() >= startMs - GIG_LIVE_LEAD_MS && now.getTime() <= startMs + GIG_LIVE_WINDOW_MS
}

/**
 * Public badge kind. Precedence: cancelled > sold out > live > announced > confirmed.
 * Pass `now: null`/undefined during SSR so "live" stays deterministic.
 */
export function resolveGigStatusKind(options: {
  status?: string | null
  soldOut?: boolean | null
  eventDate: string
  startsAt?: string | null
  now?: Date | null
}): GigStatusKind {
  const { status, soldOut, eventDate, startsAt, now } = options
  const normalized = normalizeGigStatus(status)

  if (normalized === 'cancelled') return 'cancelled'
  if (soldOut === true || isSoldOutStatus(status)) return 'soldout'
  if (now && isGigLive({ eventDate, startsAt, now })) return 'live'
  if (normalized === 'announced') return 'announced'
  return 'confirmed'
}
