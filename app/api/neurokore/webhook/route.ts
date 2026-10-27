import { z } from 'zod'
import { sessionSchema } from '@/lib/neurokore/contract-confirmation'
import { fulfillVerifiedCheckoutSession } from '@/lib/neurokore/fulfillment'
import { recordPaymentIncident } from '@/lib/neurokore/payment-events'
import { paidPackSessionSchema, fulfillDigitalPackSession, recordDigitalPackPaymentIncident } from '@/lib/digital-packs/fulfillment'
import { json, required } from '@/lib/neurokore/server'
import { assertStripeFulfillmentEnvironment, stripe, verifyWebhook } from '@/lib/neurokore/stripe'

export const runtime = 'nodejs'

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
    const event = z.object({ type: z.string(), livemode: z.boolean(), data: z.object({ object: z.record(z.string(), z.unknown()) }) })
      .parse(JSON.parse(raw))
    if (['charge.refunded', 'charge.dispute.created', 'charge.dispute.closed'].includes(event.type)) {
      stage = 'payment-incident'
      const matchedPlugin = await recordPaymentIncident(event)
      if (!matchedPlugin) await recordDigitalPackPaymentIncident(event)
      return json({ received: true })
    }
    if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type))
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
