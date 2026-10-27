type Env = Record<string, string | undefined>

/** Stripe Checkout. Independent of alpha-key issuance and the public product section. */
export function isNeurokoreSalesEnabled(env: Env = process.env): boolean {
  return env.NEUROKORE_SALES_ENABLED === 'true'
}

/**
 * Sandbox checkout is intentionally independent from database product sales state.
 * Preview only: a real Stripe test credential and explicit opt-in are required.
 * Production always ignores this switch, even if a mistaken env value is set.
 */
export function isNeurokoreSandboxPreview(env: Env = process.env): boolean {
  return env.VERCEL_ENV === 'preview' &&
    env.NEUROKORE_SANDBOX_CHECKOUT === 'true'
}

/** Status deliberately reveals no credential material. */
export function sandboxCheckoutBlocker(env: Env = process.env): 'not-preview' | 'sales-disabled' | 'invalid-stripe-key' | 'missing-price' | null {
  if (!isNeurokoreSandboxPreview(env)) return 'not-preview'
  if (env.NEUROKORE_SALES_ENABLED !== 'true') return 'sales-disabled'
  if (!/^(sk|rk)_test_[A-Za-z0-9]+$/.test(env.STRIPE_SECRET_KEY || '')) return 'invalid-stripe-key'
  if (!/^price_[A-Za-z0-9]+$/.test(env.STRIPE_SANDBOX_PRICE_ID || '')) return 'missing-price'
  return null
}

export function isNeurokoreSandboxCheckout(env: Env = process.env): boolean {
  return isNeurokoreSandboxPreview(env) && sandboxCheckoutBlocker(env) === null
}

export function isPluginSaleOpen(product: { slug: string | null; sales_enabled: boolean }, env: Env = process.env): boolean {
  return isNeurokoreSalesEnabled(env) && (
    product.sales_enabled || (product.slug === 'neurokore' && isNeurokoreSandboxCheckout(env))
  )
}
