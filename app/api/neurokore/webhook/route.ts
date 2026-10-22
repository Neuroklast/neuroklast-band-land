import { z } from 'zod'
import { getApiSecret } from '@/lib/api-secrets'
import { loadLegalConfig, formatServiceAddress } from '@/lib/legal-content'
import { encryptKey, keyHash, newKey } from '@/lib/neurokore/protocol'
import { db, json, origin } from '@/lib/neurokore/server'
import { stripe, verifyWebhook } from '@/lib/neurokore/stripe'

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
  line_items: z.object({
    has_more: z.literal(false),
    data: z.array(z.object({
      quantity: z.literal(1),
      price: z.object({ id: z.string() }),
    })).length(1),
  }),
})

function formatChargedAmount(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: currency.toUpperCase() })
  const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2
  return formatter.format(amount / Math.pow(10, digits))
}

/** Permanent contract confirmation. Do not claim withdrawal rights disappeared. */
async function sendContractConfirmation(
  client: ReturnType<typeof db>,
  order: { id: string; product_id: string; email: string },
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
  const text = [
    'NEUROKLAST – Bestätigung deiner Softwarebestellung',
    '',
    'Bestellung: ' + order.id,
    'Datum: ' + new Date().toISOString(),
    'Produkt: ' + product.title,
    'Produktdetails: ' + (product.short_description || 'Digitale Audio-Software'),
    'Systemvoraussetzungen: ' + (Array.isArray(product.system_requirements) ? product.system_requirements.join('; ') : 'Siehe Produktseite'),
    'Zahlungsart: Stripe Checkout',
    'Gezahlter Gesamtbetrag inklusive anfallender Steuern: ' + formatChargedAmount(session.amount_total, session.currency),
    'Bereitstellung: digitaler Download, kein physischer Versand.',
    'Deine Lizenz wird nach bestätigtem Zahlungseingang deinem Kundenkonto zugeordnet.',
    'Lizenzkonto: ' + siteUrl + '/neurokore/account',
    'Produktseite: ' + siteUrl + '/plugins/' + product.slug,
    '',
    'Verkäufer:',
    operator || 'Siehe Impressum: ' + siteUrl + '/legal-notice',
    'Kontakt: ' + (legal.email || 'siehe Impressum'),
    '',
    'Widerrufsbelehrung',
    'Sofern du Verbraucher bist, kannst du diesen Vertrag binnen vierzehn Tagen ohne Angabe von Gründen widerrufen. Die Frist beginnt mit Vertragsschluss.',
    'Du kannst deinen Widerruf durch eine eindeutige Erklärung an die angegebene Kontaktadresse oder online unter ' + siteUrl + '/withdrawal übermitteln. Die rechtzeitige Absendung reicht zur Fristwahrung.',
    'Bei einem wirksamen Widerruf erstatten wir die erhaltenen Zahlungen unverzüglich, spätestens innerhalb von vierzehn Tagen nach Eingang der Erklärung, grundsätzlich mit demselben Zahlungsmittel und ohne zusätzliche Erstattungsentgelte.',
    'Für digitale Inhalte kann das Widerrufsrecht nur unter den Voraussetzungen des § 356 Abs. 6 BGB erlöschen. Dieser Checkout verlangt keine Erklärung eines solchen Verzichts.',
    'Vollständige Widerrufsinformation und Musterformular: ' + siteUrl + '/withdrawal-policy',
    '',
    'Weitere Informationen: ' + siteUrl + '/purchase-info',
    'Datenschutz: ' + siteUrl + '/privacy-policy',
    'Impressum: ' + siteUrl + '/legal-notice',
    '',
    'Bitte bewahre diese Bestätigung für deine Unterlagen auf.',
  ].join('\n')
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
      subject: 'Bestätigung deiner Bestellung – ' + product.title,
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
      .select('id,product_id,email,price_id,stripe_session,confirmation_sent_at')
      .eq('id', session.client_reference_id).single()
    if (orderResult.error) throw orderResult.error
    const order = z.object({
      id: z.uuid(), product_id: z.uuid(), email: z.email(),
      price_id: z.string(), stripe_session: z.string().nullable(),
      confirmation_sent_at: z.string().nullable(),
    }).parse(orderResult.data)
    if (order.stripe_session !== session.id || order.email !== session.customer_email.toLowerCase() ||
      order.price_id !== session.line_items.data[0].price.id) throw new Error('Order mismatch')

    const key = newKey()
    const { error } = await client.rpc('plugin_fulfill', {
      p_order: order.id, p_session: session.id, p_intent: session.payment_intent,
      p_key_hash: keyHash(key), p_key_cipher: encryptKey(key, required('NEUROKORE_KEY_ENCRYPTION_SECRET')),
    })
    if (error) throw error

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
