import { z } from 'zod'
import { sessionSchema } from '@/lib/neurokore/contract-confirmation'
import { fulfillVerifiedCheckoutSession } from '@/lib/neurokore/fulfillment'
import { INCIDENT_EVENTS, SUCCESS_EVENTS, refundIncident, disputeIncident, type PaymentIncident } from '@/lib/neurokore/payment-events'
import { paidPackSessionSchema, fulfillDigitalPackSession, recordDigitalPackPaymentIncident } from '@/lib/digital-packs/fulfillment'
import { db, json, required } from '@/lib/neurokore/server'
import { assertStripeFulfillmentEnvironment, stripe, verifyWebhook } from '@/lib/neurokore/stripe'

export const runtime = 'nodejs'

/** Resolve a Stripe-owned session instead of trusting client-supplied order metadata. */
async function sessionForIntent(intent: string, secret: string) {
  const sessions = z.object({
    data: z.array(z.object({
      id: z.string().startsWith('cs_'),
      client_reference_id: z.uuid().nullable(),
      payment_intent: z.string().nullable(),
    })),
  }).parse(await stripe('checkout/sessions?payment_intent=' +
    encodeURIComponent(intent) + '&limit=2', secret))
  if (sessions.data.length !== 1 || sessions.data[0].payment_intent !== intent) return null
  const session = sessions.data[0]
  return session.client_reference_id ? { id: session.id, order: session.client_reference_id } : null
}

async function recordIncident(
  eventId: string, eventType: string, object: Record<string, unknown>,
) {
  const secret = required('STRIPE_SECRET_KEY')
  let state: PaymentIncident | null = null
  let paymentIntent: string | null = null
  let sessionId: string | null = null
  let orderId: string | null = null

  if (eventType === 'checkout.session.expired' || eventType === 'checkout.session.async_payment_failed') {
    const id = z.string().startsWith('cs_').parse(object.id)
    const session = z.object({
      id: z.string(), client_reference_id: z.uuid().nullable(),
      payment_intent: z.string().nullable(),
      status: z.string().nullable(), payment_status: z.string(),
    }).parse(await stripe('checkout/sessions/' + encodeURIComponent(id), secret))
    if (!session.client_reference_id || session.payment_status === 'paid') return
    if (eventType === 'checkout.session.expired' && session.status !== 'expired') return
    if (eventType === 'checkout.session.async_payment_failed' && session.status !== 'complete') return
    state = eventType === 'checkout.session.expired' ? 'expired' : 'failed'
    paymentIntent = session.payment_intent
    sessionId = session.id
    orderId = session.client_reference_id
  } else {
    let chargeId: string
    if (eventType.startsWith('charge.dispute.')) {
      const id = z.string().startsWith('dp_').parse(object.id)
      const dispute = z.object({
        charge: z.string().startsWith('ch_'),
        status: z.string(),
      }).parse(await stripe('disputes/' + encodeURIComponent(id), secret))
      chargeId = dispute.charge
      state = disputeIncident(dispute.status)
    } else if (eventType === 'refund.updated') {
      const refundId = z.string().startsWith('re_').parse(object.id)
      const refund = z.object({ charge: z.string().startsWith('ch_'), status: z.string() })
        .parse(await stripe('refunds/' + encodeURIComponent(refundId), secret))
      if (refund.status !== 'succeeded') return // Pending/failed refund must not revoke a licence
      chargeId = refund.charge
    } else {
      chargeId = z.string().startsWith('ch_').parse(object.id)
    }
    const charge = z.object({
      payment_intent: z.string().startsWith('pi_').nullable(),
      amount: z.number().int(), amount_refunded: z.number().int(),
    }).parse(await stripe('charges/' + encodeURIComponent(chargeId), secret))
    paymentIntent = charge.payment_intent
    if (!paymentIntent) return // Unrelated charge outside our Checkout integration
    if (!state) state = refundIncident(charge)
    if (!state) return // Failed or pending refund; do not revoke a paid licence
    const session = await sessionForIntent(paymentIntent, secret)
    if (!session) return // Another Stripe integration on the same account
    sessionId = session.id
    orderId = session.order
  }

  if (!state || !sessionId || !orderId) return
  const client = db()
  const { data: order, error: orderError } = await client.from('plugin_orders')
    .select('id,stripe_session,license_id,payment_intent')
    .eq('id', orderId).maybeSingle()
  if (orderError) throw orderError
  if (!order) return false // Stripe event belongs to another application
  if (order.stripe_session !== sessionId ||
    (order.payment_intent && paymentIntent && order.payment_intent !== paymentIntent)) {
    throw new Error('Stripe payment ownership mismatch')
  }
  const result = await client.rpc('plugin_record_payment_event', {
    p_order: orderId, p_session: sessionId, p_intent: paymentIntent,
    p_event_id: eventId, p_event_type: eventType, p_state: state,
  })
  if (result.error) throw result.error
  return true
}

/** Fulfil once. A temporary email failure triggers a Stripe retry without duplicating the licence. */
export async function POST(request: Request) {
  let stage = 'read-payload'
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
    stage = 'signature-check'
    try { verifyWebhook(raw, request.headers.get('stripe-signature') || '', required('STRIPE_WEBHOOK_SECRET')) }
    catch { return json({ error: 'Invalid signature' }, 400) }
    stage = 'event-parse'
    const event = z.object({ id: z.string().startsWith('evt_'), type: z.string(), livemode: z.boolean(), data: z.object({ object: z.record(z.string(), z.unknown()) }) })
      .parse(JSON.parse(raw))
    if (INCIDENT_EVENTS.has(event.type)) {
      stage = 'payment-incident'
      const matchedPlugin = await recordIncident(event.id, event.type, event.data.object)
      if (!matchedPlugin && ['charge.refunded', 'charge.dispute.created', 'charge.dispute.closed'].includes(event.type)) {
        await recordDigitalPackPaymentIncident(event)
      }
      return json({ received: true })
    }
    if (!SUCCESS_EVENTS.has(event.type))
      return json({ received: true })

    const sessionId = z.string().regex(/^cs_[a-zA-Z0-9_]+$/).parse(event.data.object.id)
    if (event.data.object.payment_status !== 'paid') return json({ received: true })
    stage = 'stripe-session-verify'
    const rawSession = await stripe(
      'checkout/sessions/' + sessionId + '?expand[]=line_items', required('STRIPE_SECRET_KEY'))
    // An order's type is determined solely by the Checkout Session retrieved
    // from Stripe, never by the browser or the event's untrusted metadata copy.
    const packCheckout = paidPackSessionSchema.safeParse(rawSession)
    if (packCheckout.success) {
      stage = 'digital-pack-fulfilment'
      await fulfillDigitalPackSession(packCheckout.data, event.livemode)
      return json({ received: true })
    }
    const rawMetadata = rawSession && typeof rawSession === 'object' && 'metadata' in rawSession
      ? rawSession.metadata : null
    if (rawMetadata && typeof rawMetadata === 'object' && 'digital_pack_order' in rawMetadata)
      throw new Error('Invalid digital pack Checkout Session')
    const session = sessionSchema.parse(rawSession)
    assertStripeFulfillmentEnvironment({
      eventLivemode: event.livemode, sessionLivemode: session.livemode, sessionId: session.id,
      environment: session.metadata?.environment, clientReferenceId: session.client_reference_id,
      metadataOrderId: session.metadata?.plugin_order,
    })
    await fulfillVerifiedCheckoutSession(session)
    return json({ received: true })
  } catch (error) {
    // Stripe retries on 5xx. Diagnose the failing stage without recording
    // messages, payloads, keys, e-mail addresses, tokens or request IDs.
    console.error('[neurokore-fulfilment] retryable failure', {
      stage,
      errorType: error instanceof Error ? error.name : 'unknown',
    })
    return json({ error: 'Fulfillment or customer confirmation pending' }, 500)
  }
}
