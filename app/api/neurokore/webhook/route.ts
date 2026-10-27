import { z } from 'zod'
import { sessionSchema, sendContractConfirmation } from '@/lib/neurokore/contract-confirmation'
import { encryptKey, keyHash, newKey } from '@/lib/neurokore/protocol'
import { db, json, required } from '@/lib/neurokore/server'
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
    const client = db()
    stage = 'order-lookup'
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
    if (order.email !== session.customer_email.toLowerCase() ||
      order.price_id !== session.line_items.data[0].price.id) throw new Error('Order mismatch')

    // Recover a paid checkout when Stripe successfully created the Session but
    // Vercel crashed before persisting its ID. Only a signature-verified paid
    // session with matching order metadata/email/price may claim the empty slot.
    if (order.stripe_session === null) {
      stage = 'order-link-recovery'
      const claim = await client.from('plugin_orders')
        .update({ stripe_session: session.id })
        .eq('id', order.id).is('stripe_session', null).is('test_deleted_at', null)
        .select('id').maybeSingle()
      if (claim.error) throw claim.error
      if (!claim.data) {
        const current = await client.from('plugin_orders')
          .select('stripe_session,test_deleted_at').eq('id', order.id).single()
        if (current.error || current.data?.stripe_session !== session.id || current.data?.test_deleted_at)
          throw new Error('Checkout session conflict')
      }
    } else if (order.stripe_session !== session.id) {
      throw new Error('Checkout session mismatch')
    }

    stage = 'licence-fulfilment'
    const key = newKey()
    const { data: fulfilledId, error } = await client.rpc('plugin_fulfill', {
      p_order: order.id, p_session: session.id, p_intent: session.payment_intent,
      p_key_hash: keyHash(key), p_key_cipher: encryptKey(key, required('NEUROKORE_KEY_ENCRYPTION_SECRET')),
    })
    if (error) throw error
    if (!fulfilledId) return json({ received: true })

    if (!order.confirmation_sent_at) {
      stage = 'confirmation-delivery'
      await sendContractConfirmation(client, order, session)
      stage = 'confirmation-record'
      const saved = await client.from('plugin_orders')
        .update({ confirmation_sent_at: new Date().toISOString() })
        .eq('id', order.id).is('confirmation_sent_at', null)
      if (saved.error) throw saved.error
    }
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
