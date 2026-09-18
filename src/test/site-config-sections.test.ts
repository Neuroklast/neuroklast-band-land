import { describe, expect, it } from 'vitest'
import { parseSections } from '@/lib/site-config-sections'

describe('parseSections', () => {
  it('honours visible false', () => {
    const parsed = parseSections([
      { id: 'contact', label: 'Contact', visible: false, order: 0 },
      { id: 'bio', label: 'Bio', visible: true, order: 1 },
    ])
    expect(parsed.find((s) => s.id === 'contact')?.visible).toBe(false)
    expect(parsed.find((s) => s.id === 'bio')?.visible).toBe(true)
  })

  it('coerces string/number visible flags', () => {
    const parsed = parseSections([
      { id: 'gigs', label: 'Gigs', visible: 'false', order: 0 },
      { id: 'news', label: 'News', visible: 0, order: 1 },
    ])
    expect(parsed.find((s) => s.id === 'gigs')?.visible).toBe(false)
    expect(parsed.find((s) => s.id === 'news')?.visible).toBe(false)
  })

  it('reads a wrapped { sections: [] } payload', () => {
    const parsed = parseSections({
      sections: [{ id: 'media', label: 'Media', visible: false, order: 0 }],
    })
    expect(parsed.find((s) => s.id === 'media')?.visible).toBe(false)
  })
})
