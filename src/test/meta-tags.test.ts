import { describe, it, expect } from 'vitest'
import { generateMetaTags } from '@/lib/meta-tags'
import { createSiteConfig } from '@/lib/site-config'
import type { SiteConfig } from '@/lib/types'

const baseConfig: SiteConfig = createSiteConfig({
  siteName: 'Test Artist',
  tagline: 'Hard Techno',
  description: 'Loud and dark electronic music',
  domain: 'testartist.com',
  genres: ['Techno', 'Industrial'],
  socialLinks: {
    instagram: 'https://instagram.com/testartist',
    spotify: 'https://open.spotify.com/artist/test',
  },
  seo: {
    ogImage: 'https://testartist.com/og.png',
    twitterCard: 'summary_large_image',
    twitterHandle: '@testartist',
  },
  themeSettings: { background: '#0a0a0a' },
})

describe('generateMetaTags', () => {
  it('sets title from siteName and tagline', () => {
    const tags = generateMetaTags(baseConfig)
    expect(tags.title).toContain('Test Artist')
    expect(tags.title).toContain('Hard Techno')
  })

  it('sets description from config.description', () => {
    const tags = generateMetaTags(baseConfig)
    expect(tags.description).toBe('Loud and dark electronic music')
  })

  it('sets canonical from domain', () => {
    const tags = generateMetaTags(baseConfig)
    expect(tags.canonical).toBe('https://testartist.com')
  })

  it('adds https:// prefix when domain has no scheme', () => {
    const tags = generateMetaTags(baseConfig)
    expect(tags.canonical?.startsWith('https://')).toBe(true)
  })

  it('preserves existing https:// prefix', () => {
    const config = createSiteConfig({ ...baseConfig, domain: 'https://mysite.io' })
    const tags = generateMetaTags(config)
    expect(tags.canonical).toBe('https://mysite.io')
  })

  it('populates og fields', () => {
    const tags = generateMetaTags(baseConfig)
    expect(tags.og.title).toBeTruthy()
    expect(tags.og.description).toBeTruthy()
    expect(tags.og.type).toBe('website')
    expect(tags.og.image).toBe('https://testartist.com/og.png')
    expect(tags.og.siteName).toBe('Test Artist')
  })

  it('populates twitter fields', () => {
    const tags = generateMetaTags(baseConfig)
    expect(tags.twitter.card).toBe('summary_large_image')
    expect(tags.twitter.title).toBeTruthy()
    expect(tags.twitter.site).toBe('@testartist')
  })

  it('generates JSON-LD structured data', () => {
    const tags = generateMetaTags(baseConfig)
    expect(tags.jsonLd).toBeTruthy()
    const parsed = JSON.parse(tags.jsonLd!)
    expect(parsed['@type']).toBe('MusicGroup')
    expect(parsed.name).toBe('Test Artist')
    expect(parsed.sameAs).toContain('https://instagram.com/testartist')
  })

  it('uses themeSettings.background as theme-color', () => {
    const tags = generateMetaTags(baseConfig)
    expect(tags.themeColor).toBe('#0a0a0a')
  })

  it('falls back gracefully when domain is missing', () => {
    const config = createSiteConfig({ siteName: 'Minimal', genres: [] })
    const tags = generateMetaTags(config)
    expect(tags.canonical).toBeUndefined()
    expect(tags.title).toBe('Minimal')
  })

  it('uses fallback title when siteName is empty', () => {
    const config = createSiteConfig({ siteName: '', genres: [] })
    const tags = generateMetaTags(config)
    expect(tags.title).toBeTruthy()
  })

  it('uses fallback description when description is missing', () => {
    const config = createSiteConfig({ siteName: 'Artist', genres: [] })
    const tags = generateMetaTags(config)
    expect(tags.description).toBeTruthy()
  })
})
