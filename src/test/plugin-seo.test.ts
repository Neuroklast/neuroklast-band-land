import { describe, expect, it } from 'vitest'
import { pluginCanonicalPath, pluginPreviewPath, pluginPrimaryImage, pluginSeoDescription } from '@/lib/plugins/seo'
import { buildSoftwareApplicationSchema } from '@/lib/structured-data'

describe('plugin page SEO', () => {
  it('uses exact product name and summary rather than invented product features', () => {
    expect(pluginSeoDescription({ title: 'NEUROMETER', short_description: 'Bit-transparent audio analyser.', description: 'Long description' }))
      .toBe('Bit-transparent audio analyser.')
    expect(pluginSeoDescription({ title: 'NEUROMETER', short_description: null, description: null }))
      .toContain('NEUROMETER')
  })

  it('limits descriptions without cutting short words unnecessarily', () => {
    const description = pluginSeoDescription({ title: 'Audio', short_description: 'Detailed spectrum and signal analysis '.repeat(12), description: null })
    expect(description.length).toBeLessThanOrEqual(160)
    expect(description.endsWith('…')).toBe(true)
  })

  it('routes an individual public plugin to its own canonical URL and preview', () => {
    expect(pluginCanonicalPath('neurometer')).toBe('/plugins/neurometer')
    expect(pluginPreviewPath('neurometer')).toBe('/plugins/neurometer/opengraph-image')
  })

  it('uses the first image only, ignoring videos and audio', () => {
    expect(pluginPrimaryImage({ media: [
      { kind: 'video', url: 'https://example.test/demo.mp4' },
      { kind: 'image', url: 'https://cdn.test/first.png' },
      { kind: 'image', url: 'https://cdn.test/second.png' },
    ] })).toBe('https://cdn.test/first.png')
    expect(pluginPrimaryImage({ media: [] })).toBeNull()
  })

  it('builds a truthful SoftwareApplication entity without fake offers', () => {
    const base = { name: 'NEUROMETER', url: 'https://neuroklast.net/plugins/neurometer' }
    const pending = buildSoftwareApplicationSchema(base)
    expect(pending).toMatchObject({ '@type': 'SoftwareApplication', applicationCategory: 'MultimediaApplication' })
    expect(pending?.offers).toBeUndefined()
    const published = buildSoftwareApplicationSchema({
      ...base,
      offer: { amount: 0, currency: 'EUR' },
      version: '1.0.0',
    })
    expect(published?.offers).toMatchObject({ price: '0.00', priceCurrency: 'EUR' })
  })

  it('rejects malformed software names and offers', () => {
    expect(buildSoftwareApplicationSchema({ name: '', url: 'https://neuroklast.net/plugins/foo' })).toBeNull()
    expect(buildSoftwareApplicationSchema({ name: 'X', url: 'javascript:alert(1)' })).toBeNull()
    const result = buildSoftwareApplicationSchema({
      name: 'X', url: 'https://neuroklast.net/plugins/x',
      offer: { amount: -1, currency: 'EUR' },
    })
    expect(result?.offers).toBeUndefined()
  })
})
