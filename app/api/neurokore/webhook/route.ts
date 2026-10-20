
import { z } from 'zod'
import { encryptKey, keyHash, newKey } from '@/lib/neurokore/protocol'
import { db, json, required } from '@/lib/neurokore/server'
import { stripe, verifyWebhook } from '@/lib/neurokore/stripe'
export const runtime = 'nodejs'
const sessionSchema = z.object({
  id: z.string(), mode: z.literal('payment'), payment_status: z.literal('paid'),
  client_reference_id: z.uuid(), payment_intent: z.string(),
  customer_email: z.email(),
  line_items: z.object({ has_more: z.literal(false), data: z.array(z.object({
    quantity: z.literal(1), price: z.object({ id: z.string() }),
  })).length(1) }),
})
export async function POST(request: Request) {
  try {
    // Raw bytes, never JSON-reserialized before HMAC verification.
    const reader = request.body?.getReader()
    if (!reader) return json({ error: 'Missing body' }, 400)
    const chunks: Uint8Array[] = []; let length = 0
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
    const orderResult = await client.from('neurokore_orders').select('id,email,price_id,stripe_session')
      .eq('id', session.client_reference_id).single()
    if (orderResult.error) throw orderResult.error
    const order = z.object({ id: z.uuid(), email: z.email(), price_id: z.string(), stripe_session: z.string().nullable() })
      .parse(orderResult.data)
    if (order.stripe_session !== session.id || order.email !== session.customer_email.toLowerCase() ||
      order.price_id !== session.line_items.data[0].price.id) throw new Error('Order mismatch')
    const key = newKey()
    const { error } = await client.rpc('neurokore_fulfill', {
      p_order: order.id, p_session: session.id, p_intent: session.payment_intent,
      p_key_hash: keyHash(key), p_key_cipher: encryptKey(key, required('NEUROKORE_KEY_ENCRYPTION_SECRET')),
    })
    if (error) throw error
    return json({ received: true })
  } catch {
    // Return failure so Stripe retries; no keys, payloads or customer data in logs.
    return json({ error: 'Fulfillment pending' }, 500)
  }
}
