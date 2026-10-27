import { describe, expect, it } from 'vitest'
import { isNeurokoreSalesEnabled, isNeurokoreSandboxCheckout, isNeurokoreSandboxPreview, sandboxCheckoutBlocker, isPluginSaleOpen } from '@/lib/neurokore/flags'

describe('isNeurokoreSalesEnabled', () => {
  it('is off unless the env value is the string true', () => {
    expect(isNeurokoreSalesEnabled({})).toBe(false)
    expect(isNeurokoreSalesEnabled({ NEUROKORE_SALES_ENABLED: 'false' })).toBe(false)
    expect(isNeurokoreSalesEnabled({ NEUROKORE_SALES_ENABLED: '1' })).toBe(false)
    expect(isNeurokoreSalesEnabled({ NEUROKORE_SALES_ENABLED: 'true' })).toBe(true)
  })
})

describe('Preview-only sandbox checkout', () => {
  const sandbox = {
    VERCEL_ENV: 'preview',
    NEUROKORE_SANDBOX_CHECKOUT: 'true',
    NEUROKORE_SALES_ENABLED: 'true',
    STRIPE_SECRET_KEY: 'sk_test_fakeonly',
    STRIPE_SANDBOX_PRICE_ID: 'price_fakeonly',
  }
  it('opens only NEUROKORE on explicitly enabled previews', () => {
    expect(isNeurokoreSandboxCheckout(sandbox)).toBe(true)
    expect(isPluginSaleOpen({ slug: 'neurokore', sales_enabled: false }, sandbox)).toBe(true)
    expect(isPluginSaleOpen({ slug: 'neurometer', sales_enabled: false }, sandbox)).toBe(false)
  })
  it('never opens sandbox sales on production or with live credentials', () => {
    expect(isNeurokoreSandboxCheckout({ ...sandbox, VERCEL_ENV: 'production' })).toBe(false)
    expect(isNeurokoreSandboxCheckout({ ...sandbox, STRIPE_SECRET_KEY: 'sk_live_fakeonly' })).toBe(false)
    expect(isNeurokoreSandboxCheckout({ ...sandbox, NEUROKORE_SALES_ENABLED: 'false' })).toBe(false)
    expect(isNeurokoreSandboxCheckout({ ...sandbox, NEUROKORE_SANDBOX_CHECKOUT: 'false' })).toBe(false)
    expect(isPluginSaleOpen({ slug: 'neurokore', sales_enabled: false }, { ...sandbox, VERCEL_ENV: 'production' })).toBe(false)
  })
})

describe('sandbox checkout readiness', () => {
  const config = {
    VERCEL_ENV: 'preview', NEUROKORE_SANDBOX_CHECKOUT: 'true',
    NEUROKORE_SALES_ENABLED: 'true', STRIPE_SECRET_KEY: 'sk_test_example',
    STRIPE_SANDBOX_PRICE_ID: 'price_example',
  }
  it('marks a preview as sandbox even when its key is incorrect', () => {
    const mismatched = { ...config, STRIPE_SECRET_KEY: 'sk_live_example' }
    expect(isNeurokoreSandboxPreview(mismatched)).toBe(true)
    expect(sandboxCheckoutBlocker(mismatched)).toBe('invalid-stripe-key')
    expect(isNeurokoreSandboxCheckout(mismatched)).toBe(false)
  })
  it('accepts a restricted Stripe test key where authorized', () => {
    expect(sandboxCheckoutBlocker({ ...config, STRIPE_SECRET_KEY: 'rk_test_example' })).toBe(null)
  })
  it('surfaces missing price and disabled sales and never enables production', () => {
    expect(sandboxCheckoutBlocker({ ...config, STRIPE_SANDBOX_PRICE_ID: '' })).toBe('missing-price')
    expect(sandboxCheckoutBlocker({ ...config, NEUROKORE_SALES_ENABLED: 'false' })).toBe('sales-disabled')
    expect(isNeurokoreSandboxCheckout({ ...config, VERCEL_ENV: 'production' })).toBe(false)
  })
})
