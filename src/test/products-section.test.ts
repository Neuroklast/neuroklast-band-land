import { describe, expect, it } from 'vitest'
import { sanitizeProductHref } from '@/lib/sanitize-href'
import {
  DEFAULT_SECTIONS,
  isProductsSectionVisible,
  parseSections,
} from '@/lib/site-config-sections'
import { defaultNavLinks, buildNavLinks } from '@/lib/nav-links'

describe('products section visibility', () => {
  it('defaults the products section to hidden', () => {
    const products = DEFAULT_SECTIONS.find((section) => section.id === 'products')
    expect(products?.visible).toBe(false)
    expect(isProductsSectionVisible(DEFAULT_SECTIONS)).toBe(false)
  })

  it('injects a hidden products section into saved configs that lack it', () => {
    const parsed = parseSections([
      { id: 'contact', label: 'Contact', visible: true, order: 0 },
    ])
    const products = parsed.find((section) => section.id === 'products')
    expect(products).toBeDefined()
    expect(products?.visible).toBe(false)
    expect(isProductsSectionVisible(parsed)).toBe(false)
  })

  it('reports visible when the products section is on', () => {
    expect(
      isProductsSectionVisible([
        { id: 'products', label: 'Products', visible: true, order: 13 },
      ]),
    ).toBe(true)
  })

  it('keeps products out of the default public nav', () => {
    expect(defaultNavLinks().map((link) => link.sectionId)).not.toContain('products')
  })

  it('adds a products nav anchor once the section is published', () => {
    const links = buildNavLinks([
      { id: 'products', label: 'Products', visible: true, order: 0 },
    ])
    expect(links[0]?.href).toBe('#products')
  })
})

describe('sanitizeProductHref', () => {
  it('allows same-origin paths and http(s) URLs', () => {
    expect(sanitizeProductHref('/neurokore')).toBe('/neurokore')
    expect(sanitizeProductHref('https://shop.example/item')).toBe('https://shop.example/item')
  })

  it('rejects protocol-relative, javascript, and colon paths', () => {
    expect(sanitizeProductHref('//evil.example')).toBeUndefined()
    expect(sanitizeProductHref('javascript:alert(1)')).toBeUndefined()
    expect(sanitizeProductHref('/foo:bar')).toBeUndefined()
    expect(sanitizeProductHref('\\windows')).toBeUndefined()
  })
})
