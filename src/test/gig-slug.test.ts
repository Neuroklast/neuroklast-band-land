import { describe, expect, it } from 'vitest'
import { buildGigSlugBase, buildGigSlugMap, findGigBySlug, gigDatePart, slugifyGigPart } from '@/lib/gig-slug'

function gig(overrides: Partial<Parameters<typeof buildGigSlugBase>[0]> = {}) {
  return {
    id: 'gig-1',
    title: 'Black Chapel',
    festival_name: null,
    venue: 'Nachtwerk',
    city: 'Karlsruhe',
    event_date: '2026-03-27',
    ...overrides,
  }
}

describe('slugifyGigPart', () => {
  it('transliterates umlauts and lowercases', () => {
    expect(slugifyGigPart('Köln Ü30 Straße')).toBe('koeln-ue30-strasse')
  })

  it('strips punctuation and collapses separators', () => {
    expect(slugifyGigPart('  Dark Malta Festival 2027 // MALTA ')).toBe(
      'dark-malta-festival-2027-malta',
    )
  })

  it('returns an empty string for empty input', () => {
    expect(slugifyGigPart('')).toBe('')
    expect(slugifyGigPart(null)).toBe('')
  })
})

describe('gigDatePart', () => {
  it('uses the date portion of the ISO value', () => {
    expect(gigDatePart({ event_date: '2026-03-27T20:00:00' })).toBe('2026-03-27')
  })

  it('falls back to undated', () => {
    expect(gigDatePart({ event_date: '' })).toBe('undated')
  })
})

describe('buildGigSlugBase', () => {
  it('combines event name and date', () => {
    expect(buildGigSlugBase(gig())).toBe('black-chapel-2026-03-27')
  })

  it('prefers the festival name when the title equals the venue', () => {
    expect(
      buildGigSlugBase(
        gig({ title: 'Nachtwerk', festival_name: 'Dark Spring Festival', venue: 'Nachtwerk' }),
      ),
    ).toBe('dark-spring-festival-2026-03-27')
  })

  it('falls back to the venue when there is no title', () => {
    expect(buildGigSlugBase(gig({ title: '', festival_name: null }))).toBe('nachtwerk-2026-03-27')
  })
})

describe('buildGigSlugMap', () => {
  it('keeps distinct events apart', () => {
    const map = buildGigSlugMap([gig({ id: 'a' }), gig({ id: 'b', title: 'Samhain Ritual' })])
    expect(map.get('a')).toBe('black-chapel-2026-03-27')
    expect(map.get('b')).toBe('samhain-ritual-2026-03-27')
  })

  it('appends the city on name collisions', () => {
    const map = buildGigSlugMap([
      gig({ id: 'a', city: 'Leipzig' }),
      gig({ id: 'b', city: 'Berlin' }),
    ])
    expect(map.get('a')).toBe('black-chapel-2026-03-27-leipzig')
    expect(map.get('b')).toBe('black-chapel-2026-03-27-berlin')
  })

  it('falls back to a numeric suffix when name, date and city all match', () => {
    const map = buildGigSlugMap([gig({ id: 'a' }), gig({ id: 'b' })])
    expect(map.get('a')).toBe('black-chapel-2026-03-27-karlsruhe')
    expect(map.get('b')).toBe('black-chapel-2026-03-27-karlsruhe-2')
  })

  it('is deterministic regardless of input order', () => {
    const rows = [gig({ id: 'b', city: 'Berlin' }), gig({ id: 'a', city: 'Leipzig' })]
    const forward = buildGigSlugMap(rows)
    const reversed = buildGigSlugMap([...rows].reverse())
    expect(forward.get('a')).toBe(reversed.get('a'))
    expect(forward.get('b')).toBe(reversed.get('b'))
  })
})

describe('findGigBySlug', () => {
  it('resolves a slug back to its row', () => {
    const rows = [gig({ id: 'a' }), gig({ id: 'b', title: 'Samhain Ritual' })]
    expect(findGigBySlug(rows, 'samhain-ritual-2026-03-27')?.id).toBe('b')
  })

  it('returns null for unknown slugs', () => {
    expect(findGigBySlug([gig()], 'nope')).toBeNull()
  })
})
