import 'server-only'
import { z } from 'zod'
import { isNeurokoreSalesEnabled } from './flags'
import { required } from './server'
import { stripe } from './stripe'

const priceSchema = z.object({
  unit_amount: z.number().int().nonnegative(),
  currency: z.string().min(3).max(3),
  type: z.enum(['one_time', 'recurring']),
  active: z.boolean(),
})

export type NeurokorePrice = { amount: number; currency: string; recurring: boolean }

/**
 * Stripe is the source of truth for the charged amount. Returns null when sales
 * are closed or the price cannot be loaded, so the UI never invents a price.
 */
export async function loadNeurokorePrice(): Promise<NeurokorePrice | null> {
  if (!isNeurokoreSalesEnabled()) return null
  try {
    const price = priceSchema.parse(
      await stripe(`prices/${encodeURIComponent(required('STRIPE_NEUROKORE_PRICE_ID'))}`, required('STRIPE_SECRET_KEY')),
    )
    if (!price.active) return null
    return { amount: price.unit_amount, currency: price.currency.toUpperCase(), recurring: price.type === 'recurring' }
  } catch {
    return null
  }
}

export function formatNeurokorePrice(price: NeurokorePrice): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: price.currency,
      minimumFractionDigits: price.amount % 100 === 0 ? 0 : 2,
    }).format(price.amount / 100)
  } catch {
    return `${(price.amount / 100).toFixed(2)} ${price.currency}`
  }
}
