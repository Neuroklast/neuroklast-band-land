import { describe, expect, it } from 'vitest'
import { checkoutBillingPolicy } from '../../lib/neurokore/invoicing'

describe('checkout invoice and tax safety', () => {
  it('fails closed when tax regime was not explicitly verified', () => {
    expect(() => checkoutBillingPolicy({})).toThrow()
    expect(() => checkoutBillingPolicy({ NEUROKORE_TAX_MODE: 'unconfirmed' })).toThrow()
    expect(() => checkoutBillingPolicy({ NEUROKORE_TAX_MODE: '19' })).toThrow()
  })
  it('treats qualified small businesses as tax exempt with invoice footer', () => {
    const policy = checkoutBillingPolicy({ NEUROKORE_TAX_MODE: 'small_business' })
    expect(policy.stripeAutomaticTax).toBe(false)
    expect(policy.invoiceEnabled).toBe(true)
    expect(policy.invoiceFooter).toContain('§ 19 UStG')
  })
  it('requires automatic tax for a VAT-registered merchant', () => {
    const policy = checkoutBillingPolicy({ NEUROKORE_TAX_MODE: 'vat_registered' })
    expect(policy.stripeAutomaticTax).toBe(true)
    expect(policy.invoiceEnabled).toBe(true)
    expect(policy.invoiceFooter).toBeNull()
  })
})
