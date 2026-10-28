import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const file = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')

describe('single-product NEUROKORE checkout journey', () => {
  it('keeps conversion and contract forms off the public product presentation', () => {
    const product = file('app/plugins/[slug]/page.tsx')
    expect(product).not.toContain('<PurchasePanel')
    expect(product).not.toContain('href="#purchase"')
    expect(product).toContain("'/plugins/' + product.slug + '/checkout'")
    expect(product).toContain('plugin-videos')
    expect(product.indexOf('plugin-videos')).toBeLessThan(product.indexOf('plugin-features'))
    expect(product).toContain('product.description')
  })

  it('requires a separate order step before any Stripe checkout request', () => {
    const checkoutPage = file('app/plugins/[slug]/checkout/page.tsx')
    const checkoutForm = file('app/plugins/[slug]/PurchasePanel.tsx')
    expect(checkoutPage).toContain('<PurchasePanel')
    expect(checkoutPage).toContain("isPluginSaleOpen(product)")
    expect(checkoutPage).toContain("robots: { index: false")
    expect(checkoutForm).toContain("'/api/plugins/' + encodeURIComponent(slug) + '/checkout'")
    expect(checkoutForm).toContain('if (!reviewed || busy || recurring) return')
    expect(checkoutForm).toContain('acceptedTerms: true')
    expect(file('app/api/plugins/[slug]/checkout/route.ts')).toContain('acceptedTerms: z.literal(true)')
    expect(checkoutForm).toContain('href={localizedLegalPath(language,\'terms\')}')
    expect(checkoutForm).toContain('NEUROMETER')
  })

  it('returns signed-in customers to the checkout, not the marketing page', () => {
    expect(file('app/neurokore/account/page.tsx')).toContain('href="/plugins/neurokore/checkout"')
  })
})
