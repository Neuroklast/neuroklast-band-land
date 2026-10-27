import 'server-only'
import { z } from 'zod'
import { db } from '@/lib/neurokore/server'

const paymentEvent = z.object({
  type: z.enum(['charge.refunded', 'charge.dispute.created', 'charge.dispute.closed']),
  livemode: z.boolean(),
  data: z.object({ object: z.record(z.string(), z.unknown()) }),
})

/**
 * Track post-purchase payment incidents for human action. Do not silently revoke
 * a customer's licence (or claim that offline files were remotely deleted).
 * This function receives only Stripe signature-verified event objects.
 */
export async function recordPaymentIncident(input: unknown): Promise<boolean> {
  const event = paymentEvent.parse(input)
  if (event.livemode !== (process.env.VERCEL_ENV === 'production'))
    throw new Error('Cross-environment payment incident rejected')
  const detail = event.data.object
  const intent = detail.payment_intent
  if (typeof intent !== 'string' || !/^pi_[a-zA-Z0-9_]+$/.test(intent))
    return false // Events from other Stripe products may lack a linked PaymentIntent.
  let state: string
  if (event.type === 'charge.refunded') {
    const amount = detail.amount
    const refunded = detail.amount_refunded
    if (typeof amount !== 'number' || typeof refunded !== 'number' ||
      refunded <= 0 || amount <= 0 || refunded > amount) throw new Error('Invalid refund event')
    state = refunded === amount ? 'refunded' : 'partially_refunded'
  } else {
    state = event.type === 'charge.dispute.created' ? 'disputed' : 'dispute_closed'
  }
  const client = db()
  const { data: order, error } = await client.from('plugin_orders')
    .select('id,product_id,payment_state').eq('payment_intent', intent).maybeSingle()
  if (error) throw error
  if (!order) return false
  // A refund notification is stronger than a subsequent duplicate checkout event.
  // A dispute closure needs manual assessment rather than resetting to "paid".
  if (order.payment_state === state) return true
  const result = await client.from('plugin_orders').update({
    payment_state: state, payment_state_at: new Date().toISOString(),
  }).eq('id', order.id)
  if (result.error) throw result.error
  const audit = await client.from('plugin_admin_audit').insert({
    product_id: order.product_id, actor: null,
    action: 'order.stripe.' + event.type, target: order.id,
    detail: { state, automated: true, requires_review: true },
  })
  if (audit.error) throw audit.error
  return true
}
