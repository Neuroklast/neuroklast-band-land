import { describe, expect, it } from 'vitest'
import {
  BASE_URL,
  STATIC_URLS,
  LOCALIZED_LEGAL_URLS,
  buildSitemap,
  newsSitemapUrls,
  gigSitemapUrls,
  pluginSitemapUrls,
  soundpackSitemapUrls,
} from '@/lib/sitemap-entries'

describe('pure public sitemap contract', () => {
  it('preserves the established static URLs and their priorities', () => {
    expect(BASE_URL).toBe('https://neuroklast.net')
    expect(STATIC_URLS.map(item => [item.loc, item.changefreq, item.priority])).toEqual([
      [BASE_URL + '/', 'weekly', '1.0'],
      [BASE_URL + '/releases', 'weekly', '0.8'],
      [BASE_URL + '/gigs', 'weekly', '0.8'],
      [BASE_URL + '/media', 'weekly', '0.7'],
      [BASE_URL + '/booking', 'monthly', '0.7'],
      [BASE_URL + '/news', 'daily', '0.7'],
      [BASE_URL + '/plugins', 'weekly', '0.8'],
      [BASE_URL + '/soundpacks', 'weekly', '0.7'],
      [BASE_URL + '/withdrawal', 'monthly', '0.3'],
    ])
  })

  it('keeps published legal locales and stable localized URLs', () => {
    const locs = LOCALIZED_LEGAL_URLS.map(item => item.loc)
    expect(locs).toContain(BASE_URL + '/legal/en/privacy-policy')
    expect(locs).toContain(BASE_URL + '/legal/de/privacy-policy')
    expect(locs).not.toContain(BASE_URL + '/legal/ja/privacy-policy')
    expect(locs).not.toContain(BASE_URL + '/legal/uk/privacy-policy')
    expect(LOCALIZED_LEGAL_URLS).toHaveLength(12)
  })

  it('serializes stable XML and escapes every variable location/lastmod character', () => {
    const xml = buildSitemap([
      { loc: BASE_URL + '/a&b<>"\'', changefreq: 'monthly', priority: '0.6',
        lastmod: '2026-10-29&<>"\'' },
      { loc: BASE_URL + '/z', changefreq: 'weekly', priority: '0.7' },
    ])
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')).toBe(true)
    expect(xml).toContain('<loc>' + BASE_URL + '/a&amp;b&lt;&gt;&quot;&apos;</loc>')
    expect(xml).toContain('<lastmod>2026-10-29&amp;&lt;&gt;&quot;&apos;</lastmod>')
    expect(xml).toContain('<changefreq>monthly</changefreq>')
    expect(xml).toContain('<priority>0.6</priority>')
    expect(xml.match(/<lastmod>/g)).toHaveLength(1)
    expect(xml.indexOf('/a&amp;b')).toBeLessThan(xml.indexOf('/z</loc>'))
    expect(xml.endsWith('</urlset>')).toBe(true)
  })

  it('maps public news without inventing a modification date', () => {
    expect(newsSitemapUrls([
      { slug: 'tour-news', published_at: '2026-03-01T00:00:00.000Z', updated_at: '2026-09-12T02:30:00.000Z' },
      { slug: 'uncorrected', published_at: '2026-01-03T00:00:00.000Z', updated_at: null },
      { slug: 'unpublished-date', published_at: null, updated_at: null },
      { slug: 'name/#?', published_at: null, updated_at: null },
      { slug: '', published_at: null, updated_at: null },
    ])).toEqual([
      { loc: BASE_URL + '/news/tour-news', changefreq: 'monthly', priority: '0.6', lastmod: '2026-09-12' },
      { loc: BASE_URL + '/news/uncorrected', changefreq: 'monthly', priority: '0.6', lastmod: '2026-01-03' },
      { loc: BASE_URL + '/news/unpublished-date', changefreq: 'monthly', priority: '0.6', lastmod: undefined },
      { loc: BASE_URL + '/news/name%2F%23%3F', changefreq: 'monthly', priority: '0.6', lastmod: undefined },
    ])
  })

  it('shares gig slugs with the public page contract and does not use event date as lastmod', () => {
    const rows = [
      { id: '1', title: 'Show', festival_name: null, venue: 'Club', city: 'Berlin', event_date: '2026-12-01' },
      { id: '2', title: 'Show', festival_name: null, venue: 'Club', city: 'Hamburg', event_date: '2026-12-01' },
    ]
    const result = gigSitemapUrls(rows)
    expect(result).toHaveLength(2)
    expect(result[0].loc).toBe(BASE_URL + '/gigs/show-2026-12-01-berlin')
    expect(result[1].loc).toBe(BASE_URL + '/gigs/show-2026-12-01-hamburg')
    expect(result.every(item => item.lastmod === undefined)).toBe(true)
  })

  it('excludes malformed plugin slugs while retaining the previously accepted format', () => {
    expect(pluginSitemapUrls([
      { slug: 'neurokore' }, { slug: 'neuro-meter' },
      { slug: 'unwanted/slash' }, { slug: 'Upper' }, { slug: '' },
    ]).map(item => item.loc)).toEqual([
      BASE_URL + '/plugins/neurokore',
      BASE_URL + '/plugins/neuro-meter',
    ])
  })

  it('includes only UUID-shaped soundpack identifiers from public records', () => {
    expect(soundpackSitemapUrls([
      { id: '12345678-1234-1234-1234-1234567890ab' },
      { id: '12345678-1234-1234-1234-1234567890AB' },
      { id: 'javascript:alert(1)' },
      { id: 'not-a-uuid' },
    ]).map(item => item.loc)).toEqual([
      BASE_URL + '/soundpacks/12345678-1234-1234-1234-1234567890ab',
      BASE_URL + '/soundpacks/12345678-1234-1234-1234-1234567890AB',
    ])
  })
})
