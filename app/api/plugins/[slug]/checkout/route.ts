import { randomUUID } from 'node:crypto'
import { LEGAL_LOCALES } from '@/lib/legal-i18n'
import { localizedLegalPath } from '@/lib/legal-routes'
import { COMMERCE_TERMS_VERSION } from '@/lib/commerce-version'
import { commerceSections } from '@/lib/commerce-legal-copy'
import { contractDocumentText } from '@/lib/neurokore/email-format'
import { z } from 'zod'
import { getApiSecret } from '@/lib/api-secrets'
import { body, db, json, limit, origin, required, sameOrigin, unavailable, user } from '@/lib/neurokore/server'
import { isNeurokoreSalesEnabled } from '@/lib/neurokore/flags'
import { validateLicenseConfiguration } from '@/lib/neurokore/protocol'
import { signingKeyFor } from '@/lib/plugins/signing'
import { slugSchema } from '@/lib/plugins/releases'
import { hasSellableRelease, saleReleaseSchema } from '@/lib/plugins/sale-readiness'
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
    const requested = z.object({ locale: z.enum(LEGAL_LOCALES).default('en') }).strict()
      .safeParse(await body(request))
    if (!requested.success) return json({ error: 'Invalid checkout request.' }, 400)
    const locale = requested.data.locale
    // Stripe Checkout does not provide Ukrainian UI at present; EN is fallback.
    const stripeLocale = locale === 'uk' ? 'en' : locale
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

    // Query release records directly; anonymous download availability is a separate switch.
    // No paid checkout until at least one validated binary is actually published.
    const releaseResult = await client.from('plugin_releases')
      .select('id,status,withdrawn_at,plugin_release_artifacts(id,validation_status,storage_key,filesize_bytes,sha256)')
      .eq('product_id', product.id)
      .eq('status', 'published')
      .is('withdrawn_at', null)
      .order('published_at', { ascending: false })
      .limit(25)
    if (releaseResult.error) throw releaseResult.error
    const releases = z.array(saleReleaseSchema).parse(releaseResult.data ?? [])
    if (!hasSellableRelease(releases)) {
      return json({ error: 'Sales are unavailable until a validated plugin build has been published.' }, 409)
    }

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
      tax_behavior: z.enum(['inclusive', 'exclusive', 'unspecified']).nullable(),
    }).parse(await stripe('prices/' + encodeURIComponent(price), required('STRIPE_SECRET_KEY')))
    if (!stripePrice.active || stripePrice.type !== 'one_time' || stripePrice.unit_amount === null || stripePrice.tax_behavior !== 'inclusive') {
      return json({ error: 'This product requires an active tax-inclusive one-time Stripe price.' }, 409)
    }

    const encryptionSecret = required('NEUROKORE_KEY_ENCRYPTION_SECRET')
    const pem = signingKeyFor(
      { slug: product.slug, signing_key_cipher: secretResult.data?.signing_key_cipher ?? null },
      encryptionSecret,
      process.env.NEUROKORE_SIGNING_PRIVATE_KEY,
    )
    validateLicenseConfiguration(pem, encryptionSecret)
    required('STRIPE_WEBHOOK_SECRET')
    // A sale must not start if we cannot send the contract confirmation.
    if (!await getApiSecret('resend_api_key')) {
      return json({ error: 'Sales unavailable: contract email service is not configured.' }, 503)
    }

    const id = randomUUID()
    const termsSnapshot = contractDocumentText(commerceSections('terms', locale, legal.termsText))
    const licenceSnapshot = contractDocumentText(commerceSections('license', locale))
    const insert = await client.from('plugin_orders').insert({
      id, product_id: product.id, user_id: buyer.id, email: buyer.email, price_id: price,
      terms_snapshot: termsSnapshot, licence_snapshot: licenceSnapshot,
      terms_version: COMMERCE_TERMS_VERSION,
    })
    if (insert.error) throw insert.error

    const params = new URLSearchParams({
      mode: 'payment', customer_email: buyer.email, client_reference_id: id,
      'metadata[plugin_order]': id,
      'metadata[locale]': locale,
      'metadata[terms_version]': COMMERCE_TERMS_VERSION,
      locale: stripeLocale,
      'line_items[0][price]': price, 'line_items[0][quantity]': '1',
      success_url: origin() + '/neurokore/account?checkout=success',
      cancel_url: origin() + '/plugins/' + product.slug + '?checkout=cancelled',
      'automatic_tax[enabled]': 'true',
      'billing_address_collection': 'required',
      'consent_collection[terms_of_service]': 'required',
      'custom_text[submit][message]': 'Terms: ' + origin() + localizedLegalPath(locale, 'terms') + ' | Withdrawal: ' + origin() + localizedLegalPath(locale, 'withdrawal-policy'),
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
