import 'server-only'
import { z } from 'zod'
import { isNeurokoreSalesEnabled } from '../neurokore/flags'
import { db, required } from '../neurokore/server'
import { stripe } from '../neurokore/stripe'

const priceSchema = z.object({
  unit_amount: z.number().int().nonnegative(),
  currency: z.string().min(3).max(3),
  type: z.enum(['one_time', 'recurring']),
  active: z.boolean(),
  tax_behavior: z.enum(['inclusive', 'exclusive', 'unspecified']).nullable(),
})

export type ProductPrice = { amount: number; currency: string; recurring: boolean }

/**
 * Stripe is the source of truth for the charged amount. Returns null when the
 * global kill switch is off, the product has no price, or the price cannot be
 * loaded, so the UI never invents a price.
 */
export async function loadProductPrice(priceId: string | null): Promise<ProductPrice | null> {
  if (!priceId || !isNeurokoreSalesEnabled()) return null
  try {
    const price = priceSchema.parse(
      await stripe(`prices/${encodeURIComponent(priceId)}`, required('STRIPE_SECRET_KEY')),
    )
    // B2C storefronts must show the tax-inclusive total, not a net price.
    if (!price.active || price.tax_behavior !== 'inclusive') return null
    return { amount: price.unit_amount, currency: price.currency.toUpperCase(), recurring: price.type === 'recurring' }
  } catch {
    return null
  }
}

/** Price for one product, resolved server-side from its stored Stripe price ID. */
export async function loadProductPriceForProduct(productId: string): Promise<ProductPrice | null> {
  if (!isNeurokoreSalesEnabled()) return null
  try {
    const { data, error } = await db().from('plugin_product_secrets')
      .select('stripe_price_id').eq('product_id', productId).maybeSingle()
    if (error) return null
    return loadProductPrice(data?.stripe_price_id ?? null)
  } catch {
    return null
  }
}

export function formatProductPrice(price: ProductPrice): string {  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: price.currency,
      minimumFractionDigits: price.amount % 100 === 0 ? 0 : 2,
    }).format(price.amount / 100)
  } catch {
    return `${(price.amount / 100).toFixed(2)} ${price.currency}`
  }
}
