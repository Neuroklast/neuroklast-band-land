import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { db, body, json, limit, sameOrigin, origin, user, required } from '@/lib/neurokore/server'
import { digitalPackSalesOpen, loadDigitalPack } from '@/lib/digital-packs/store'
import { digitalPackBucket } from '@/lib/digital-packs/storage'
import { configureManagedPaymentsCheckout, configureNeurokoreSandboxCheckout, stripe } from '@/lib/neurokore/stripe'
import { loadLegalConfig, getLegalCompleteness } from '@/lib/legal-content'
import { getApiSecret } from '@/lib/api-secrets'
import { COMMERCE_TERMS_VERSION } from '@/lib/commerce-version'
import { commerceSections } from '@/lib/commerce-legal-copy'
import { contractDocumentText } from '@/lib/neurokore/email-format'

export const runtime = 'nodejs'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    sameOrigin(request)
    await limit(request, 'digital-pack-checkout', 5)
    const { id } = await params
    if (!z.uuid().safeParse(id).success) return json({ error: 'Unknown pack.' }, 404)
    const payload = z.object({ acceptedTerms: z.literal(true) }).strict().parse(await body(request))
    if (!payload.acceptedTerms) return json({ error: 'Review the terms before payment.' }, 400)
    const buyer = await user().catch(() => null)
    if (!buyer) return json({ error: 'Sign in before buying.' }, 401)
    if (!digitalPackSalesOpen()) return json({ error: 'Paid soundpack sales are not yet enabled.' }, 503)
    digitalPackBucket()
    const client = db()
    const pack = await loadDigitalPack(id)
    if (!pack || pack.is_free || pack.price_cents < 100 || !pack.archive_key || !pack.archive_filename)
      return json({ error: 'This soundpack is not for sale.' }, 409)
    const legal = await loadLegalConfig(client)
    if (!getLegalCompleteness(legal).complete)
      return json({ error: 'Seller legal information is incomplete.' }, 503)
    if (!await getApiSecret('resend_api_key'))
      return json({ error: 'Purchase confirmation email is not configured.' }, 503)
    required('STRIPE_WEBHOOK_SECRET')
    const sandbox = process.env.VERCEL_ENV !== 'production'
    if (!sandbox && process.env.STRIPE_MANAGED_PAYMENTS_ENABLED !== 'true')
      return json({ error: 'Managed Payments onboarding is required before sales.' }, 503)
    const orderId = randomUUID()
    const inserted = await client.from('digital_pack_orders').insert({
      id: orderId, pack_id: pack.id, user_id: buyer.id, email: buyer.email,
      amount_cents: pack.price_cents, currency: 'eur',
      archive_key: pack.archive_key, archive_filename: pack.archive_filename,
      pack_title: pack.title,
      terms_snapshot: contractDocumentText(commerceSections('terms','en',legal.termsText)),
      license_snapshot: pack.license_notes,
      terms_version: COMMERCE_TERMS_VERSION,
    })
    if (inserted.error) throw inserted.error

    const paramsStripe = new URLSearchParams({
      mode: 'payment',
      customer_email: buyer.email,
      client_reference_id: orderId,
      'metadata[digital_pack_order]': orderId,
      'metadata[environment]': sandbox ? 'neurokore-sandbox' : 'live',
      'metadata[terms_version]': COMMERCE_TERMS_VERSION,
      locale: 'auto',
      'line_items[0][price_data][currency]': 'eur',
      'line_items[0][price_data][unit_amount]': String(pack.price_cents),
      'line_items[0][price_data][tax_behavior]': 'inclusive',
      'line_items[0][price_data][product_data][name]': pack.title,
      // Samples are audio recordings; preset ZIPs are electronically supplied files.
      'line_items[0][price_data][product_data][tax_code]':
        pack.pack_type === 'sample_pack' ? 'txcd_10401100' : 'txcd_10000000',
      'line_items[0][quantity]': '1',
      success_url: origin() + '/soundpacks/library?checkout=success',
      cancel_url: origin() + '/soundpacks/' + pack.id + '?checkout=cancelled',
      'automatic_tax[enabled]': 'true',
      'billing_address_collection': 'required',
      'consent_collection[terms_of_service]': 'required',
      'custom_text[submit][message]': 'Terms: ' + origin() + '/terms | Withdrawal: ' + origin() + '/withdrawal-policy',
    })
    if (sandbox) configureNeurokoreSandboxCheckout(paramsStripe)
    else configureManagedPaymentsCheckout(paramsStripe)
    const data = z.object({ id: z.string(), url: z.url() }).parse(await stripe(
      'checkout/sessions', required('STRIPE_SECRET_KEY'), paramsStripe,
      orderId, '2026-04-22.dahlia',
    ))
    if (new URL(data.url).hostname !== 'checkout.stripe.com') throw new Error('Unexpected checkout host')
    const saved = await client.from('digital_pack_orders').update({ stripe_session: data.id })
      .eq('id',orderId).eq('status','pending')
    if (saved.error) throw saved.error
    return json({ url: data.url })
  } catch (error) {
    console.error('[digital-packs] checkout unavailable', { errorType:error instanceof Error?error.name:'unknown' })
    return json({ error: 'Pack checkout is unavailable. No payment has been taken.' }, 503)
  }
}
