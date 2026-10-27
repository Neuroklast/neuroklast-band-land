import { z } from 'zod'
import { admin, body, db, json, limit, required, sameOrigin } from '@/lib/neurokore/server'
import { stripe } from '@/lib/neurokore/stripe'
import { sessionSchema } from '@/lib/neurokore/contract-confirmation'
import { fulfillVerifiedCheckoutSession } from '@/lib/neurokore/fulfillment'

export const runtime = 'nodejs'

/**
 * Privileged, non-charging repair. A session must be independently read back
 * from Stripe and the common settlement path validates its order ownership,
 * product Price ID, email, test/live environment and paid status.
 */
export async function POST(request: Request) {
  try {
    sameOrigin(request)
    await limit(request, 'plugin-order-reconcile', 6)
    const actor = await admin()
    const input = z.object({
      orderId: z.uuid(),
      sessionId: z.string().regex(/^cs_(test|live)_[a-zA-Z0-9_]+$/).optional(),
    }).strict().parse(await body(request))
    const client = db()
    const { data: order, error } = await client.from('plugin_orders')
      .select('id,stripe_session,test_deleted_at,payment_state')
      .eq('id', input.orderId).single()
    if (error || !order || order.test_deleted_at) return json({ error: 'Order unavailable.' }, 404)
    if (['refunded','partially_refunded','disputed','dispute_closed'].includes(order.payment_state))
      return json({ error: 'Payment requires manual review; a refund or dispute is recorded.' }, 409)
    const sessionId = input.sessionId ?? order.stripe_session
    if (!sessionId) return json({ error: 'No Stripe Checkout Session is linked. Provide a verified Session ID.' }, 409)
    if (order.stripe_session && order.stripe_session !== sessionId)
      return json({ error: 'Session conflicts with this order.' }, 409)
    const session = sessionSchema.parse(await stripe(
      'checkout/sessions/' + encodeURIComponent(sessionId) + '?expand[]=line_items',
      required('STRIPE_SECRET_KEY'),
    ))
    if (session.client_reference_id !== order.id) return json({ error: 'Session does not match this order.' }, 409)
    const result = await fulfillVerifiedCheckoutSession(session)
    // This audit record does not include email addresses, keys or payment data.
    await client.from('plugin_admin_audit').insert({
      actor, action: 'order.reconcile', target: order.id, detail: { result: result.status },
    })
    return json({ status: result.status })
  } catch (error) {
    console.error('[neurokore-reconcile] failed', {
      errorType: error instanceof Error ? error.name : 'unknown',
    })
    return json({ error: 'Unable to reconcile. Check the authenticated Stripe Session and server logs.' }, 503)
  }
}
