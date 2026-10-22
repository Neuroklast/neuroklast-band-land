import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { db, json, limit, origin, required, sameOrigin, unavailable, user } from '@/lib/neurokore/server'
import { isNeurokoreSalesEnabled } from '@/lib/neurokore/flags'
import { validateLicenseConfiguration } from '@/lib/neurokore/protocol'
import { signingKeyFor } from '@/lib/plugins/signing'
import { slugSchema } from '@/lib/plugins/releases'
import { stripe } from '@/lib/neurokore/stripe'
import { loadLegalConfig, getLegalCompleteness } from '@/lib/legal-content'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ slug: string }>
}

export async function POST(request: Request, context: RouteContext) {
  try {
    sameOrigin(request)
    await limit(request, 'plugin-checkout', 5)
    const { slug } = await context.params
    if (!slugSchema.safeParse(slug).success) return json({ error: 'Plugin not found.' }, 404)
    const buyer = await user()
    if (!isNeurokoreSalesEnabled()) return json({ error: 'Sales are not open yet.' }, 503)

    const client = db()
    // Do not accept money while mandatory legal operator details are missing.
    const legal = await loadLegalConfig(client)
    if (!getLegalCompleteness(legal).complete) {
      return json({ error: 'Checkout unavailable: complete legal operator details in admin first.' }, 503)
    }
    const productResult = await client.from('products')
      .select('id,slug,pricing_mode,sales_enabled,license_required,license_format')
      .eq('slug', slug).eq('kind', 'plugin').eq('active', true).maybeSingle()
    if (productResult.error) throw productResult.error
    if (!productResult.data) return json({ error: 'Plugin not found.' }, 404)
    const product = productResult.data
    if (product.pricing_mode !== 'paid') return json({ error: 'This plugin is free.' }, 409)
    if (!product.sales_enabled) return json({ error: 'Sales are not open for this plugin.' }, 409)
    if (!product.license_required) return json({ error: 'This plugin does not need a license.' }, 409)

    const secretResult = await client.from('plugin_product_secrets')
      .select('stripe_price_id,signing_key_cipher').eq('product_id', product.id).maybeSingle()
    if (secretResult.error) throw secretResult.error
    const price = secretResult.data?.stripe_price_id
    if (!price) return json({ error: 'This plugin has no price configured.' }, 503)
    // The checkout is deliberately one-time only. Never charge recurring prices
    // through a payment-mode session or present a misleading one-off price.
    const stripePrice = z.object({
      active: z.boolean(),
      type: z.enum(['one_time', 'recurring']),
      currency: z.string(),
      unit_amount: z.number().int().nonnegative().nullable(),
    }).parse(await stripe('prices/' + encodeURIComponent(price), required('STRIPE_SECRET_KEY')))
    if (!stripePrice.active || stripePrice.type !== 'one_time' || stripePrice.unit_amount === null) {
      return json({ error: 'This product has no valid one-time price.' }, 409)
    }

    const encryptionSecret = required('NEUROKORE_KEY_ENCRYPTION_SECRET')
    const pem = signingKeyFor(
      { slug: product.slug, signing_key_cipher: secretResult.data?.signing_key_cipher ?? null },
      encryptionSecret,
      process.env.NEUROKORE_SIGNING_PRIVATE_KEY,
    )
    validateLicenseConfiguration(pem, encryptionSecret)
    required('STRIPE_WEBHOOK_SECRET')

    const id = randomUUID()
    const insert = await client.from('plugin_orders').insert({
      id, product_id: product.id, user_id: buyer.id, email: buyer.email, price_id: price,
    })
    if (insert.error) throw insert.error

    const params = new URLSearchParams({
      mode: 'payment', customer_email: buyer.email, client_reference_id: id,
      'metadata[plugin_order]': id,
      'line_items[0][price]': price, 'line_items[0][quantity]': '1',
      success_url: origin() + '/neurokore/account?checkout=success',
      cancel_url: origin() + '/plugins/' + product.slug + '?checkout=cancelled',
      'automatic_tax[enabled]': 'true',
      'billing_address_collection': 'required',
      'consent_collection[terms_of_service]': 'required',
      'custom_text[submit][message]': 'The final total including applicable taxes is shown before payment. Information on withdrawal: ' + origin() + '/withdrawal-policy',
    })
    const session = z.object({ id: z.string(), url: z.url() }).parse(
      await stripe('checkout/sessions', required('STRIPE_SECRET_KEY'), params, id))
    if (new URL(session.url).hostname !== 'checkout.stripe.com') throw new Error('Invalid checkout')
    const saved = await client.from('plugin_orders').update({ stripe_session: session.id }).eq('id', id)
    if (saved.error) throw saved.error
    return json({ url: session.url })
  } catch {
    return unavailable()
  }
}
