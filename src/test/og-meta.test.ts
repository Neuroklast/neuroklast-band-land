import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Tests for the OG meta-tag API logic.
 *
 * We extract and test the pure helper functions (resolveContent, esc,
 * plainText, fmtDate) that power the /api/og endpoint, without needing
 * a real HTTP server or KV connection.
 */

// --- Inline copies of the pure functions from api/og.js ---

function esc(str: string | undefined | null): string {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function plainText(str: string | undefined | null, maxLen = 200): string {
  if (!str) return ''
  const plain = String(str)
    .replace(/[<>]/g, '')
    .replace(/[#*_~`\-[\]()!]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return plain.length > maxLen ? plain.slice(0, maxLen) + '…' : plain
}

function fmtDate(iso: string | undefined | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const FALLBACK_TITLE = 'NEUROKLAST'
const FALLBACK_DESCRIPTION = 'NEUROKLAST – Hard Techno, Industrial, DNB & Dark Electro.'
const FALLBACK_IMAGE = '/favicon.svg'

interface ContentMeta {
  title: string
  description: string
  image: string
  hash: string
}

function resolveContent(data: Record<string, unknown>, type: string, id: string): ContentMeta | null {
  if (!data || !type || !id) return null

  if (type === 'news') {
    const items = (data.news as Array<Record<string, string>>) || []
    const item = items.find((n) => n.id === id)
    if (!item) return null
    return {
      title: plainText(item.text, 70) || FALLBACK_TITLE,
      description: plainText(item.details || item.text),
      image: item.photo || (data.logoUrl as string) || FALLBACK_IMAGE,
      hash: `#news/${id}`,
    }
  }

  if (type === 'gig') {
    const items = (data.gigs as Array<Record<string, string>>) || []
    const item = items.find((g) => g.id === id)
    if (!item) return null
    const dateStr = fmtDate(item.date)
    return {
      title: `${(data.name as string) || FALLBACK_TITLE} @ ${item.venue}`,
      description: `${dateStr} – ${item.venue}, ${item.location}`,
      image: item.photo || (data.logoUrl as string) || FALLBACK_IMAGE,
      hash: `#gigs/${id}`,
    }
  }

  if (type === 'release') {
    const items = (data.releases as Array<Record<string, string>>) || []
    const item = items.find((r) => r.id === id)
    if (!item) return null
    const typeLabel = item.type ? ` (${item.type.toUpperCase()})` : ''
    return {
      title: `${item.title}${typeLabel} – ${(data.name as string) || FALLBACK_TITLE}`,
      description: plainText(item.description) || `${item.title} by ${(data.name as string) || FALLBACK_TITLE}`,
      image: item.artwork || (data.logoUrl as string) || FALLBACK_IMAGE,
      hash: `#releases/${id}`,
    }
  }

  return null
}

// --- Tests ---

describe('OG meta tag helpers', () => {
  describe('esc', () => {
    it('escapes HTML special characters', () => {
      expect(esc('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      )
    })

    it('returns empty string for falsy input', () => {
      expect(esc('')).toBe('')
      expect(esc(null)).toBe('')
      expect(esc(undefined)).toBe('')
    })

    it('escapes ampersands and single quotes', () => {
      expect(esc("Rock & Roll's finest")).toBe('Rock &amp; Roll&#39;s finest')
    })
  })

  describe('plainText', () => {
    it('strips markdown formatting', () => {
      expect(plainText('**Bold** and _italic_')).toBe('Bold and italic')
    })

    it('strips HTML tags', () => {
      // Angle brackets removed, tag names become plain text words
      const result = plainText('<p>Hello <b>World</b></p>')
      expect(result).not.toContain('<')
      expect(result).not.toContain('>')
      expect(result).toContain('Hello')
      expect(result).toContain('World')
    })

    it('strips nested/malformed tags that could bypass single-pass sanitization', () => {
      expect(plainText('<<script>script>alert("xss")<</script>/script>')).not.toContain('<script')
      expect(plainText('<<script>script>alert("xss")<</script>/script>')).not.toContain('<')
    })

    it('truncates long text', () => {
      const long = 'A'.repeat(250)
      const result = plainText(long, 200)
      expect(result.length).toBe(201) // 200 chars + ellipsis
      expect(result.endsWith('…')).toBe(true)
    })

    it('returns empty for falsy input', () => {
      expect(plainText('')).toBe('')
      expect(plainText(null)).toBe('')
    })
  })

  describe('fmtDate', () => {
    it('formats ISO date', () => {
      const result = fmtDate('2025-03-15')
      expect(result).toContain('15')
      expect(result).toContain('2025')
    })

    it('returns original string for invalid dates', () => {
      expect(fmtDate('not-a-date')).toBe('not-a-date')
    })

    it('returns empty for falsy input', () => {
      expect(fmtDate('')).toBe('')
      expect(fmtDate(null)).toBe('')
    })
  })

  describe('resolveContent', () => {
    const bandData = {
      name: 'NEUROKLAST',
      logoUrl: 'https://example.com/logo.png',
      news: [
        { id: 'n1', text: 'New album **out now**!', details: 'Full details about the release.', photo: 'https://example.com/news.jpg', date: '2025-01-15' },
        { id: 'n2', text: 'Tour announcement', date: '2025-02-01' },
      ],
      gigs: [
        { id: 'g1', date: '2025-06-01T20:00', venue: 'Berghain', location: 'Berlin, Germany', photo: 'https://example.com/gig.jpg' },
        { id: 'g2', date: '2025-07-15', venue: 'Tresor', location: 'Berlin, Germany' },
      ],
      releases: [
        { id: 'r1', title: 'Dark Signal', type: 'ep', artwork: 'https://example.com/art.jpg', description: 'A dark techno EP.' },
        { id: 'r2', title: 'Neon Pulse', artwork: 'https://example.com/neon.jpg' },
      ],
    }

    it('resolves news item with photo', () => {
      const meta = resolveContent(bandData, 'news', 'n1')
      expect(meta).not.toBeNull()
      expect(meta!.title).toBe('New album out now')
      expect(meta!.description).toBe('Full details about the release.')
      expect(meta!.image).toBe('https://example.com/news.jpg')
      expect(meta!.hash).toBe('#news/n1')
    })

    it('resolves news item without photo – falls back to logoUrl', () => {
      const meta = resolveContent(bandData, 'news', 'n2')
      expect(meta).not.toBeNull()
      expect(meta!.image).toBe('https://example.com/logo.png')
    })

    it('resolves gig with photo', () => {
      const meta = resolveContent(bandData, 'gig', 'g1')
      expect(meta).not.toBeNull()
      expect(meta!.title).toBe('NEUROKLAST @ Berghain')
      expect(meta!.description).toContain('Berghain')
      expect(meta!.description).toContain('Berlin, Germany')
      expect(meta!.image).toBe('https://example.com/gig.jpg')
      expect(meta!.hash).toBe('#gigs/g1')
    })

    it('resolves gig without photo – falls back to logoUrl', () => {
      const meta = resolveContent(bandData, 'gig', 'g2')
      expect(meta!.image).toBe('https://example.com/logo.png')
    })

    it('resolves release with type label', () => {
      const meta = resolveContent(bandData, 'release', 'r1')
      expect(meta).not.toBeNull()
      expect(meta!.title).toBe('Dark Signal (EP) – NEUROKLAST')
      expect(meta!.description).toBe('A dark techno EP.')
      expect(meta!.image).toBe('https://example.com/art.jpg')
      expect(meta!.hash).toBe('#releases/r1')
    })

    it('resolves release without type', () => {
      const meta = resolveContent(bandData, 'release', 'r2')
      expect(meta!.title).toBe('Neon Pulse – NEUROKLAST')
      expect(meta!.description).toBe('Neon Pulse by NEUROKLAST')
    })

    it('returns null for unknown item id', () => {
      expect(resolveContent(bandData, 'news', 'unknown')).toBeNull()
      expect(resolveContent(bandData, 'gig', 'unknown')).toBeNull()
      expect(resolveContent(bandData, 'release', 'unknown')).toBeNull()
    })

    it('returns null for unknown type', () => {
      expect(resolveContent(bandData, 'podcast', 'n1')).toBeNull()
    })

    it('returns null when data is missing', () => {
      expect(resolveContent({}, 'news', 'n1')).toBeNull()
    })

    it('falls back to FALLBACK_IMAGE when no image and no logoUrl', () => {
      const dataNoLogo = { ...bandData, logoUrl: undefined, gigs: [{ id: 'g3', date: '2025-08-01', venue: 'Test', location: 'Test' }] }
      const meta = resolveContent(dataNoLogo, 'gig', 'g3')
      expect(meta!.image).toBe('/favicon.svg')
    })
  })
})
