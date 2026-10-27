/** Explicit tax decision required before charging for plugin downloads.
 * Do not infer VAT or §19 eligibility from Stripe's country or price settings.
 */
export type TaxMode = 'small_business' | 'vat_registered'
type Environment = Record<string, string | undefined>

export function checkoutBillingPolicy(env: Environment = process.env) {
  const mode = env.NEUROKORE_TAX_MODE
  if (mode !== 'small_business' && mode !== 'vat_registered') {
    throw new Error('Software checkout unavailable until the seller tax regime is verified')
  }
  return {
    mode: mode as TaxMode,
    stripeAutomaticTax: mode === 'vat_registered',
    invoiceEnabled: true,
    invoiceFooter: mode === 'small_business'
      ? 'Umsatzsteuerfrei nach § 19 UStG. Es wird keine Umsatzsteuer ausgewiesen.'
      : null,
  }
}
