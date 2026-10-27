import { z } from 'zod'
import { getApiSecret } from '@/lib/api-secrets'
import { loadLegalConfig, formatServiceAddress } from '@/lib/legal-content'
import { encryptKey, keyHash, newKey } from '@/lib/neurokore/protocol'
import { db, json, origin, required } from '@/lib/neurokore/server'
import { stripe, verifyWebhook } from '@/lib/neurokore/stripe'
import { COMMERCE_LEGAL_COPY, commerceSections } from '@/lib/commerce-legal-copy'
import { contractDocumentText, contractEmailText } from '@/lib/neurokore/email-format'
import { WITHDRAWAL_COPY } from '@/lib/legal-withdrawal-i18n'
import { LEGAL_LOCALES } from '@/lib/legal-i18n'
import { localizedLegalPath } from '@/lib/legal-routes'
import { COMMERCE_TERMS_VERSION } from '@/lib/commerce-version'

export const runtime = 'nodejs'

const sessionSchema = z.object({
  id: z.string(),
  mode: z.literal('payment'),
  payment_status: z.literal('paid'),
  client_reference_id: z.uuid(),
  payment_intent: z.string(),
  customer_email: z.email(),
  amount_total: z.number().int().nonnegative(),
  currency: z.string().min(3).max(3),
  metadata: z.object({ locale: z.enum(LEGAL_LOCALES).optional(), terms_version: z.string().optional() }).nullable().optional(),
  line_items: z.object({
    has_more: z.literal(false),
    data: z.array(z.object({
      quantity: z.literal(1),
      price: z.object({ id: z.string() }),
    })).length(1),
  }),
})

function formatChargedAmount(amount: number, currency: string, locale: string): string {
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency: currency.toUpperCase() })
  const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2
  return formatter.format(amount / Math.pow(10, digits))
}

/** Permanent contract confirmation. Do not claim withdrawal rights disappeared. */
async function sendContractConfirmation(
  client: ReturnType<typeof db>,
  order: { id: string; product_id: string; email: string; terms_snapshot: string | null; licence_snapshot: string | null; terms_version: string | null },
  session: z.infer<typeof sessionSchema>,
): Promise<void> {
  const [productResult, legal, resendKey] = await Promise.all([
    client.from('products').select('title,slug,short_description,system_requirements').eq('id', order.product_id).single(),
    loadLegalConfig(client),
    getApiSecret('resend_api_key'),
  ])
  if (productResult.error || !productResult.data || !resendKey) throw new Error('Confirmation prerequisites unavailable')

  const product = productResult.data
  const operator = formatServiceAddress(legal)
  const siteUrl = origin()
  const locale = session.metadata?.locale ?? 'en'
  const translations = COMMERCE_LEGAL_COPY[locale]
  const withdrawal = WITHDRAWAL_COPY[locale]
  const termsText = order.terms_snapshot ?? contractDocumentText(commerceSections('terms', locale, legal.termsText))
  const licenceText = order.licence_snapshot ?? contractDocumentText(commerceSections('license', locale))
  const text = contractEmailText([
    'NEUROKLAST AUDIO | ' + translations.docs.purchase,
    'Contract terms version: ' + (order.terms_version ?? session.metadata?.terms_version ?? COMMERCE_TERMS_VERSION),
    '',
    'Order reference: ' + order.id,
    'Date: ' + new Date().toISOString(),
    'Product: ' + product.title,
    'Description: ' + (product.short_description || product.title),
    'System requirements: ' + (Array.isArray(product.system_requirements) ? product.system_requirements.join('; ') : 'See product page'),
    'Payment provider: Stripe',
    'Total charged including applicable tax: ' + formatChargedAmount(session.amount_total, session.currency, locale),
    'Digital delivery. No physical shipment.',
    'Your software licence is assigned to your account after payment confirmation.',
    'Account: ' + siteUrl + '/neurokore/account',
    'Product: ' + siteUrl + '/plugins/' + product.slug,
    '',
    translations.sections.seller[0] + ':',
    operator || siteUrl + localizedLegalPath(locale, 'legal-notice'),
    'Email: ' + (legal.email || siteUrl + '/legal-notice'),
    '',
    translations.docs.withdrawal,
    withdrawal.period,
    withdrawal.refunds,
    withdrawal.exception,
    'Online withdrawal: ' + siteUrl + '/withdrawal',
    'Withdrawal information: ' + siteUrl + localizedLegalPath(locale, 'withdrawal-policy'),
    '',
    translations.docs.terms,
    termsText,
    '',
    translations.docs.license,
    licenceText,
    '',
    siteUrl + localizedLegalPath(locale, 'purchase-info'),
    siteUrl + localizedLegalPath(locale, 'privacy-policy'),
    siteUrl + '/legal-notice',
  ])
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + resendKey,
      // Stripe may retry a webhook. Resend must not send duplicate confirmations.
      'Idempotency-Key': 'plugin-contract-' + order.id,
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || 'NEUROKLAST <noreply@neuroklast.net>',
      to: [order.email],
      subject: translations.docs.purchase + ' – ' + product.title,
      text,
    }),
  })
  if (!response.ok) throw new Error('Contract confirmation email unavailable')
}

/** Fulfil once. A temporary email failure triggers a Stripe retry without duplicating the licence. */
export async function POST(request: Request) {
  try {
    const reader = request.body?.getReader()
    if (!reader) return json({ error: 'Missing body' }, 400)
    const chunks: Uint8Array[] = []
    let length = 0
    while (true) {
      const next = await reader.read()
      if (next.done) break
      length += next.value.length
      if (length > 262144) { await reader.cancel(); return json({ error: 'Too large' }, 413) }
      chunks.push(next.value)
    }
    const raw = Buffer.concat(chunks).toString('utf8')
    try { verifyWebhook(raw, request.headers.get('stripe-signature') || '', required('STRIPE_WEBHOOK_SECRET')) }
    catch { return json({ error: 'Invalid signature' }, 400) }
    const event = z.object({ type: z.string(), data: z.object({ object: z.record(z.string(), z.unknown()) }) })
      .parse(JSON.parse(raw))
    if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type))
      return json({ received: true })

    const sessionId = z.string().regex(/^cs_[a-zA-Z0-9_]+$/).parse(event.data.object.id)
    if (event.data.object.payment_status !== 'paid') return json({ received: true })
    const session = sessionSchema.parse(await stripe(
      'checkout/sessions/' + sessionId + '?expand[]=line_items', required('STRIPE_SECRET_KEY')))
    const client = db()
    const orderResult = await client.from('plugin_orders')
      .select('id,product_id,email,price_id,stripe_session,confirmation_sent_at,terms_snapshot,licence_snapshot,terms_version,test_deleted_at')
      .eq('id', session.client_reference_id).single()
    if (orderResult.error) throw orderResult.error
    const order = z.object({
      id: z.uuid(), product_id: z.uuid(), email: z.email(),
      price_id: z.string(), stripe_session: z.string().nullable(),
      confirmation_sent_at: z.string().nullable(),
      test_deleted_at: z.string().nullable(),
      terms_snapshot: z.string().nullable(),
      licence_snapshot: z.string().nullable(),
      terms_version: z.string().nullable(),
    }).parse(orderResult.data)
    // A wiped sandbox test order must never produce another licence or email.
    if (order.test_deleted_at) return json({ received: true })
    if (order.stripe_session !== session.id || order.email !== session.customer_email.toLowerCase() ||
      order.price_id !== session.line_items.data[0].price.id) throw new Error('Order mismatch')

    const key = newKey()
    const { data: fulfilledId, error } = await client.rpc('plugin_fulfill', {
      p_order: order.id, p_session: session.id, p_intent: session.payment_intent,
      p_key_hash: keyHash(key), p_key_cipher: encryptKey(key, required('NEUROKORE_KEY_ENCRYPTION_SECRET')),
    })
    if (error) throw error
    if (!fulfilledId) return json({ received: true })

    if (!order.confirmation_sent_at) {
      await sendContractConfirmation(client, order, session)
      const saved = await client.from('plugin_orders')
        .update({ confirmation_sent_at: new Date().toISOString() })
        .eq('id', order.id).is('confirmation_sent_at', null)
      if (saved.error) throw saved.error
    }
    return json({ received: true })
  } catch {
    // Fail closed so Stripe retries; never log secrets or customer data.
    return json({ error: 'Fulfillment or customer confirmation pending' }, 500)
  }
}
