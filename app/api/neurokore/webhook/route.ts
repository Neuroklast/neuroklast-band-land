import { z } from 'zod'
import { sessionSchema } from '@/lib/neurokore/contract-confirmation'
import { fulfillVerifiedCheckoutSession } from '@/lib/neurokore/fulfillment'
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
    if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type))
      return json({ received: true })

    const sessionId = z.string().regex(/^cs_[a-zA-Z0-9_]+$/).parse(event.data.object.id)
    if (event.data.object.payment_status !== 'paid') return json({ received: true })
    stage = 'stripe-session-verify'
    const session = sessionSchema.parse(await stripe(
      'checkout/sessions/' + sessionId + '?expand[]=line_items', required('STRIPE_SECRET_KEY')))
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
