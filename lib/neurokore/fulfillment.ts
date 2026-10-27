import 'server-only'
import { z } from 'zod'
import { encryptKey, keyHash, newKey } from '@/lib/neurokore/protocol'
import { db, required } from '@/lib/neurokore/server'
import { assertStripeFulfillmentEnvironment } from '@/lib/neurokore/stripe'
import { sessionSchema, sendContractConfirmation } from '@/lib/neurokore/contract-confirmation'

/**
 * Shared Stripe-confirmed, idempotent order settlement. Only a fetched paid
 * Stripe Checkout Session may enter here, never client-supplied payment state.
 * Called from signed webhooks or the separately authenticated admin reconciler.
 */
export async function fulfillVerifiedCheckoutSession(session: z.infer<typeof sessionSchema>) {
  assertStripeFulfillmentEnvironment({
    eventLivemode: session.livemode,
    sessionLivemode: session.livemode,
    sessionId: session.id,
    environment: session.metadata?.environment,
    clientReferenceId: session.client_reference_id,
    metadataOrderId: session.metadata?.plugin_order,
  })
    const client = db()
    const orderResult = await client.from('plugin_orders')
      .select('id,product_id,email,price_id,stripe_session,confirmation_sent_at,terms_snapshot,licence_snapshot,terms_version,test_deleted_at,payment_state')
      .eq('id', session.client_reference_id).single()
    if (orderResult.error) throw orderResult.error
    const order = z.object({
      id: z.uuid(), product_id: z.uuid(), email: z.email(),
      price_id: z.string(), stripe_session: z.string().nullable(),
      confirmation_sent_at: z.string().nullable(),
      test_deleted_at: z.string().nullable(),
      payment_state: z.string().nullable(),
      terms_snapshot: z.string().nullable(),
      licence_snapshot: z.string().nullable(),
      terms_version: z.string().nullable(),
    }).parse(orderResult.data)
    // A wiped sandbox test order must never produce another licence or email.
    if (order.test_deleted_at) return { status: 'deleted' as const }
    if (order.email !== session.customer_email.toLowerCase() ||
      order.price_id !== session.line_items.data[0].price.id) throw new Error('Order mismatch')

    // Preserve disputes/refunds. A webhook replay must not reverse those states.
    if (['refunded','partially_refunded','disputed','dispute_closed'].includes(order.payment_state || ''))
      return { status: 'payment-review' as const }

    // Recover a paid checkout when Stripe successfully created the Session but
    // Vercel crashed before persisting its ID. Only a signature-verified paid
    // session with matching order metadata/email/price may claim the empty slot.
    if (order.stripe_session === null) {
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

    const key = newKey()
    const { data: fulfilledId, error } = await client.rpc('plugin_fulfill', {
      p_order: order.id, p_session: session.id, p_intent: session.payment_intent,
      p_key_hash: keyHash(key), p_key_cipher: encryptKey(key, required('NEUROKORE_KEY_ENCRYPTION_SECRET')),
    })
    if (error) throw error
    if (!fulfilledId) return { status: 'deleted' as const }
    const paid = await client.from('plugin_orders').update({
      payment_state: 'paid', payment_state_at: new Date().toISOString(),
    }).eq('id', order.id).in('payment_state', ['pending', 'paid'])
    if (paid.error) throw paid.error

    if (!order.confirmation_sent_at) {
      const receiptClaim = await client.rpc('plugin_claim_confirmation', { p_order: order.id })
      if (receiptClaim.error) throw receiptClaim.error
      if (!receiptClaim.data) return { status: 'confirmation-in-progress' as const }
      try {
        await sendContractConfirmation(client, order, session)
        const saved = await client.from('plugin_orders')
          .update({ confirmation_sent_at: new Date().toISOString(), confirmation_claimed_at: null, confirmation_error_at: null })
          .eq('id', order.id).is('confirmation_sent_at', null)
        if (saved.error) throw saved.error
      } catch {
        // Release the short lease now so a later authenticated retry can deliver.
        await client.from('plugin_orders').update({
          confirmation_claimed_at: null, confirmation_error_at: new Date().toISOString(),
        }).eq('id', order.id).is('confirmation_sent_at', null)
        throw new Error('Contract confirmation delivery pending')
      }
    }
    return { status: 'fulfilled' as const }
}
