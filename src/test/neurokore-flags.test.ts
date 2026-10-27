import { describe, expect, it } from 'vitest'
import { isNeurokoreSalesEnabled, isNeurokoreSandboxCheckout, isPluginSaleOpen } from '@/lib/neurokore/flags'

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
