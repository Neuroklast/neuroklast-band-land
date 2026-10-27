import { z } from 'zod'
import { decryptKey } from '@/lib/neurokore/protocol'
import { admin, body, db, json, limit, required, sameOrigin } from '@/lib/neurokore/server'

export const runtime = 'nodejs'

/** MFA-gated, audited, explicitly requested plaintext key disclosure. */
export async function POST(request: Request) {
  try {
    sameOrigin(request)
    await limit(request, 'admin-order-key-reveal', 12)
    const actor = await admin()
    const { orderId } = z.object({ orderId: z.uuid() }).strict().parse(await body(request))
    const client = db()
    const { data: order, error: orderError } = await client.from('plugin_orders')
      .select('id,product_id,email,license_id,test_deleted_at').eq('id', orderId).single()
    if (orderError || !order || order.test_deleted_at || !order.license_id)
      return json({ error: 'Licence not available.' }, 404)
    const { data: licence, error: licenceError } = await client.from('plugin_licenses')
      .select('id,email,product_id,key_cipher,revoked_at')
      .eq('id', order.license_id).eq('product_id', order.product_id).maybeSingle()
    if (licenceError || !licence || licence.email !== order.email)
      return json({ error: 'Licence does not match this order.' }, 409)
    const audit = await client.from('plugin_admin_audit').insert({
      actor, product_id: order.product_id, action: 'order.license.reveal', target: licence.id,
      detail: { order_id: order.id },
    })
    if (audit.error) return json({ error: 'Audit unavailable. Key not revealed.' }, 503)
    return json({ key: decryptKey(licence.key_cipher, required('NEUROKORE_KEY_ENCRYPTION_SECRET')), revoked: !!licence.revoked_at })
  } catch {
    return json({ error: 'Key unavailable. Check admin session, MFA and encryption configuration.' }, 403)
  }
}
