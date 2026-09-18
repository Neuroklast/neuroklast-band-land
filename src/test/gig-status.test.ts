import { describe, expect, it } from 'vitest'
import {
  GIG_LIVE_WINDOW_MS,
  isGigLive,
  isSoldOutStatus,
  normalizeGigStatus,
  resolveGigStatusKind,
} from '@/lib/gig-status'

describe('normalizeGigStatus', () => {
  it('maps both cancelled spellings to the canonical value', () => {
    expect(normalizeGigStatus('cancelled')).toBe('cancelled')
    expect(normalizeGigStatus('canceled')).toBe('cancelled')
    expect(normalizeGigStatus('CANCELLED')).toBe('cancelled')
  })

  it('keeps announced and falls back to confirmed', () => {
    expect(normalizeGigStatus('announced')).toBe('announced')
    expect(normalizeGigStatus(null)).toBe('confirmed')
    expect(normalizeGigStatus('')).toBe('confirmed')
    expect(normalizeGigStatus('whatever')).toBe('confirmed')
  })
})

describe('isSoldOutStatus', () => {
  it('recognises legacy sold-out status spellings', () => {
    expect(isSoldOutStatus('soldout')).toBe(true)
    expect(isSoldOutStatus('sold_out')).toBe(true)
    expect(isSoldOutStatus('Sold Out')).toBe(true)
    expect(isSoldOutStatus('confirmed')).toBe(false)
  })
})

describe('isGigLive', () => {
  const eventDate = '2026-05-01T22:00:00Z'

  it('is live inside the window around the start', () => {
    expect(isGigLive({ eventDate, now: new Date('2026-05-01T22:30:00Z') })).toBe(true)
    expect(isGigLive({ eventDate, now: new Date('2026-05-01T21:30:00Z') })).toBe(true)
  })

  it('is not live before the lead or after the window', () => {
    expect(isGigLive({ eventDate, now: new Date('2026-05-01T19:00:00Z') })).toBe(false)
    const after = new Date(new Date(eventDate).getTime() + GIG_LIVE_WINDOW_MS + 60_000)
    expect(isGigLive({ eventDate, now: after })).toBe(false)
  })

  it('treats whole-day events as live for their calendar day', () => {
    expect(isGigLive({ eventDate: '2026-05-01', now: new Date('2026-05-01T12:00:00Z') })).toBe(true)
    expect(isGigLive({ eventDate: '2026-05-01', now: new Date('2026-05-02T12:00:00Z') })).toBe(false)
  })
})

describe('resolveGigStatusKind', () => {
  const base = { eventDate: '2026-05-01T22:00:00Z', now: null }

  it('lets cancellation win over everything', () => {
    expect(resolveGigStatusKind({ ...base, status: 'cancelled', soldOut: true })).toBe('cancelled')
  })

  it('reports sold out from the flag or the legacy status', () => {
    expect(resolveGigStatusKind({ ...base, status: 'confirmed', soldOut: true })).toBe('soldout')
    expect(resolveGigStatusKind({ ...base, status: 'soldout' })).toBe('soldout')
  })

  it('reports live only when a clock is available', () => {
    expect(
      resolveGigStatusKind({ ...base, status: 'confirmed', now: new Date('2026-05-01T22:15:00Z') }),
    ).toBe('live')
    expect(resolveGigStatusKind({ ...base, status: 'confirmed', now: null })).toBe('confirmed')
  })

  it('reports announced and defaults to confirmed', () => {
    expect(resolveGigStatusKind({ ...base, status: 'announced' })).toBe('announced')
    expect(resolveGigStatusKind({ ...base, status: 'confirmed' })).toBe('confirmed')
  })
})
