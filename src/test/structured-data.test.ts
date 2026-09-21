import { describe, expect, it } from 'vitest'
import {
  absoluteUrl,
  buildBreadcrumbSchema,
  buildMusicEventSchema,
  buildMusicGroupSchema,
  buildWebSiteSchema,
  serializeJsonLd,
} from '@/lib/structured-data'

describe('absoluteUrl', () => {
  it('joins an origin and a site-relative path', () => {
    expect(absoluteUrl('https://neuroklast.net', '/gigs')).toBe('https://neuroklast.net/gigs')
  })

  it('normalizes a trailing slash on the origin and a missing leading slash on the path', () => {
    expect(absoluteUrl('https://neuroklast.net/', 'gigs')).toBe('https://neuroklast.net/gigs')
  })

  it('passes absolute http(s) URLs through unchanged', () => {
    expect(absoluteUrl('https://neuroklast.net', 'https://example.com/x')).toBe(
      'https://example.com/x',
    )
  })
})

describe('serializeJsonLd', () => {
  it('escapes < so a value can never close the script element', () => {
    const payload = serializeJsonLd({ name: '</script><img src=x>' })
    expect(payload).not.toContain('</script>')
    expect(payload).toContain('\\u003c')
  })

  it('round-trips through JSON.parse', () => {
    const data = { '@type': 'MusicGroup', name: 'Neuroklast' }
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data)
  })
})

describe('buildMusicGroupSchema', () => {
  it('returns null without a name or url', () => {
    expect(buildMusicGroupSchema({ name: '', url: 'https://neuroklast.net' })).toBeNull()
    expect(buildMusicGroupSchema({ name: 'Neuroklast', url: '' })).toBeNull()
  })

  it('builds a MusicGroup with genres and https-only sameAs entries', () => {
    const schema = buildMusicGroupSchema({
      name: 'Neuroklast',
      url: 'https://neuroklast.net',
      genres: ['Industrial', ' ', 'Darkwave'],
      sameAs: [
        'https://open.spotify.com/artist/x',
        'http://insecure.example.com',
        'https://open.spotify.com/artist/x',
      ],
    })

    expect(schema).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'MusicGroup',
      name: 'Neuroklast',
      url: 'https://neuroklast.net',
      genre: ['Industrial', 'Darkwave'],
      sameAs: ['https://open.spotify.com/artist/x'],
    })
  })
})

describe('buildWebSiteSchema', () => {
  it('requires a name and url', () => {
    expect(buildWebSiteSchema({ name: 'Neuroklast', url: '' })).toBeNull()
    expect(buildWebSiteSchema({ name: 'Neuroklast', url: 'https://neuroklast.net' })).toMatchObject({
      '@type': 'WebSite',
    })
  })
})

describe('buildBreadcrumbSchema', () => {
  it('returns null for empty input', () => {
    expect(buildBreadcrumbSchema([])).toBeNull()
  })

  it('numbers positions from 1 and drops entries without a valid URL', () => {
    const schema = buildBreadcrumbSchema([
      { name: 'Home', url: 'https://neuroklast.net/' },
      { name: 'Broken', url: 'not-a-url' },
      { name: 'Events', url: 'https://neuroklast.net/gigs' },
    ])

    expect(schema?.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://neuroklast.net/' },
      { '@type': 'ListItem', position: 2, name: 'Events', item: 'https://neuroklast.net/gigs' },
    ])
  })
})

describe('buildMusicEventSchema', () => {
  const base = {
    name: 'Black Chapel',
    startDate: '2026-03-27',
    url: 'https://neuroklast.net/gigs/black-chapel',
    performerName: 'Neuroklast',
  }

  it('returns null without required fields', () => {
    expect(buildMusicEventSchema({ ...base, name: '' })).toBeNull()
    expect(buildMusicEventSchema({ ...base, startDate: '' })).toBeNull()
    expect(buildMusicEventSchema({ ...base, performerName: '' })).toBeNull()
  })

  it('builds a scheduled event with a place', () => {
    const schema = buildMusicEventSchema({
      ...base,
      venueName: 'Nachtwerk',
      city: 'Karlsruhe',
      country: 'DE',
    })

    expect(schema).toMatchObject({
      '@type': 'MusicEvent',
      eventStatus: 'https://schema.org/EventScheduled',
      location: {
        '@type': 'Place',
        name: 'Nachtwerk',
        address: { '@type': 'PostalAddress', addressLocality: 'Karlsruhe', addressCountry: 'DE' },
      },
    })
    expect(schema?.offers).toBeUndefined()
  })

  it('marks cancelled events and sold-out offers', () => {
    const schema = buildMusicEventSchema({
      ...base,
      cancelled: true,
      soldOut: true,
      ticketUrl: 'https://pretix.eu/no-sax/event/',
    })

    expect(schema?.eventStatus).toBe('https://schema.org/EventCancelled')
    expect(schema?.offers).toMatchObject({
      '@type': 'Offer',
      availability: 'https://schema.org/SoldOut',
    })
  })

  it('ignores non-https ticket URLs', () => {
    const schema = buildMusicEventSchema({ ...base, ticketUrl: 'http://tickets.example.com' })
    expect(schema?.offers).toBeUndefined()
  })
})
