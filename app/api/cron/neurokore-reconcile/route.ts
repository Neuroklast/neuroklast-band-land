import { timingSafeEqual } from 'node:crypto'
import { db, json, required } from '@/lib/neurokore/server'
import { sessionSchema } from '@/lib/neurokore/contract-confirmation'
import { stripe } from '@/lib/neurokore/stripe'
import { fulfillVerifiedCheckoutSession } from '@/lib/neurokore/fulfillment'

export const runtime = 'nodejs'
export const maxDuration = 60

/** Native Vercel Cron. No Preview or live reconciliation without explicit opt-in. */
export async function GET(request: Request) {
  if (process.env.VERCEL_ENV !== 'production' ||
      process.env.NEUROKORE_RECONCILIATION_ENABLED !== 'true')
    return json({ disabled: true })
  const secret = process.env.CRON_SECRET
  const supplied = request.headers.get('authorization')?.replace(/^Bearer /, '') || ''
  if (!secret || Buffer.byteLength(supplied) !== Buffer.byteLength(secret) ||
    !timingSafeEqual(Buffer.from(supplied), Buffer.from(secret)))
    return json({ error: 'Unauthorized' }, 401)
  try {
    const client = db()
    // Production only: never consume sandbox orders from a shared DB.
    const { data, error } = await client.from('plugin_orders')
      .select('id,stripe_session,payment_state')
      .like('stripe_session', 'cs_live_%')
      .is('test_deleted_at', null)
      .in('payment_state', ['pending', 'paid'])
      .or('license_id.is.null,confirmation_sent_at.is.null')
      .order('created_at', { ascending: false })
      .limit(10)
    if (error) throw error
    let repaired = 0
    let failed = 0
    let pending = 0
    for (const order of data || []) {
      if (!order.stripe_session?.startsWith('cs_live_')) continue
      try {
        const raw = await stripe(
          'checkout/sessions/' + encodeURIComponent(order.stripe_session) + '?expand[]=line_items',
          required('STRIPE_SECRET_KEY'),
        )
        const parsed = sessionSchema.safeParse(raw)
        if (!parsed.success) { pending++; continue }
        if (parsed.data.client_reference_id !== order.id) throw new Error('Order mismatch')
        const result = await fulfillVerifiedCheckoutSession(parsed.data)
        if (result.status === 'fulfilled') repaired++
        else pending++
      } catch { failed++ }
    }
    if (failed) console.error('[neurokore-reconciliation] pending failures', { failed })
    return json({ checked: (data || []).length, repaired, failed, pending })
  } catch {
    console.error('[neurokore-reconciliation] batch failed')
    return json({ error: 'Reconciliation temporarily unavailable' }, 503)
  }
}
