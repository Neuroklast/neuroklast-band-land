
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { db, json, limit, origin, required, sameOrigin, unavailable, user } from '@/lib/neurokore/server'
import { validateLicenseConfiguration } from '@/lib/neurokore/protocol'
import { stripe } from '@/lib/neurokore/stripe'
export const runtime = 'nodejs'
export async function POST(request: Request) {
  try {
    sameOrigin(request)
    await limit(request, 'neurokore-checkout', 5)
    const buyer = await user()
    if (process.env.NEUROKORE_SALES_ENABLED !== 'true') return json({ error: 'Sales are not open yet.' }, 503)
    validateLicenseConfiguration(required('NEUROKORE_SIGNING_PRIVATE_KEY'), required('NEUROKORE_KEY_ENCRYPTION_SECRET'))
    required('STRIPE_WEBHOOK_SECRET')
    const download = new URL(required('NEUROKORE_DOWNLOAD_URL'))
    if (download.protocol !== 'https:') throw new Error('Download unavailable')
    const id = randomUUID()
    const price = required('STRIPE_NEUROKORE_PRICE_ID')
    const client = db()
    const { error } = await client.from('neurokore_orders').insert({
      id, user_id: buyer.id, email: buyer.email, price_id: price,
    })
    if (error) throw error
    const params = new URLSearchParams({
      mode: 'payment', customer_email: buyer.email, client_reference_id: id,
      'metadata[neurokore_order]': id,
      'line_items[0][price]': price, 'line_items[0][quantity]': '1',
      success_url: origin() + '/neurokore/account?checkout=success',
      cancel_url: origin() + '/neurokore/account?checkout=cancelled',
      'automatic_tax[enabled]': 'true',
      'billing_address_collection': 'required',
      'consent_collection[terms_of_service]': 'required',
    })
    const session = z.object({ id: z.string(), url: z.url() }).parse(
      await stripe('checkout/sessions', required('STRIPE_SECRET_KEY'), params, id))
    if (new URL(session.url).hostname !== 'checkout.stripe.com') throw new Error('Invalid checkout')
    const saved = await client.from('neurokore_orders').update({ stripe_session: session.id }).eq('id', id)
    if (saved.error) throw saved.error
    return json({ url: session.url })
  } catch { return unavailable() }
}
