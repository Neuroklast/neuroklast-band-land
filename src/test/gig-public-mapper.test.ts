import { describe, expect, it } from 'vitest'
import {
  eventDisplayName,
  formatGigLocation,
  mapGigRowToOverlayGig,
} from '@/lib/gig-public-mapper'

describe('mapGigRowToOverlayGig', () => {
  it('maps location, venue, and ticket url for the overlay', () => {
    const gig = mapGigRowToOverlayGig({
      id: 'gig-1',
      title: 'Live Show',
      venue: 'Club X',
      city: 'Berlin',
      country: 'Germany',
      event_date: '2026-08-01T20:00:00Z',
      ticket_url: 'https://tickets.example.com/1',
      festival_name: 'Festival X',
      description: 'Industrial night.',
    })

    expect(gig.id).toBe('gig-1')
    expect(gig.title).toBe('Live Show')
    expect(gig.venue).toBe('Club X')
    expect(gig.location).toBe('Club X, Berlin, Germany')
    expect(gig.date).toBe('2026-08-01T20:00:00Z')
    expect(gig.ticketUrl).toBe('https://tickets.example.com/1')
    expect(gig.description).toBe('Industrial night.')
    expect(gig.startsAt).toBe('2026-08-01T20:00:00Z')
  })

  it('uses the event name as the overlay title, not the club', () => {
    const row = {
      id: 'gig-samhain',
      title: 'P8',
      venue: 'P8',
      city: 'Schauenburgstraße 5, 76135 Karlsruhe',
      country: 'Germany',
      event_date: '2026-10-31',
      ticket_url: null,
      festival_name: 'Samhain Ritual',
    }
    expect(eventDisplayName(row)).toBe('Samhain Ritual')
    const gig = mapGigRowToOverlayGig(row)
    expect(gig.title).toBe('Samhain Ritual')
    expect(gig.location).toContain('P8')
    expect(gig.location).toContain('Karlsruhe')
  })

  it('keeps a single OSM line when the address is already in venue', () => {
    expect(
      formatGigLocation({
        venue: 'P8, Schauenburgstraße 5, 76135 Karlsruhe, Germany',
        city: 'Karlsruhe',
        country: 'Germany',
      }),
    ).toBe('P8, Schauenburgstraße 5, 76135 Karlsruhe, Germany')
  })

  it('falls back to title when venue is missing', () => {
    const gig = mapGigRowToOverlayGig({
      id: 'gig-2',
      title: 'Warehouse Rave',
      venue: null,
      city: 'Vienna',
      country: 'Austria',
      event_date: '2026-09-01',
      ticket_url: null,
      festival_name: null,
      description: null,
    })

    expect(gig.title).toBe('Warehouse Rave')
    expect(gig.location).toBe('Vienna, Austria')
    expect(gig.ticketUrl).toBeUndefined()
    expect(gig.startsAt).toBeUndefined()
  })
})