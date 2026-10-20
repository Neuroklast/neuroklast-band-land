type Env = Record<string, string | undefined>

/** Stripe Checkout. Independent of alpha-key issuance and the public product section. */
export function isNeurokoreSalesEnabled(env: Env = process.env): boolean {
  return env.NEUROKORE_SALES_ENABLED === 'true'
}
