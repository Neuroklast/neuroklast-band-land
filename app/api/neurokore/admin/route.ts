
import { z } from 'zod'
import { decryptKey, encryptKey, keyHash, newKey } from '@/lib/neurokore/protocol'
import { adminFailureMessage } from '@/lib/neurokore/admin-error'
import { admin, body, db, json, limit, required, sameOrigin } from '@/lib/neurokore/server'
export async function POST(request: Request) {
  try {
    sameOrigin(request)
    await limit(request, 'neurokore-admin', 20)
    const createdBy = await admin()
    const input = z.discriminatedUnion('action', [
      z.object({ action: z.literal('issue'), email: z.email(), days: z.number().int().min(1).max(365) }).strict(),
      z.object({ action: z.literal('reveal'), id: z.uuid() }).strict(),
      z.object({ action: z.literal('revoke'), id: z.uuid() }).strict(),
      z.object({ action: z.literal('reset'), id: z.uuid() }).strict(),
    ]).parse(await body(request))
    const client = db()
    if (input.action === 'issue') {
      const key = newKey()
      const { data, error } = await client.from('neurokore_licenses').insert({
        email: input.email.toLowerCase(), key_hash: keyHash(key),
        key_cipher: encryptKey(key, required('NEUROKORE_KEY_ENCRYPTION_SECRET')),
        tier: 'alpha', expires_at: new Date(Date.now() + input.days * 86400000).toISOString(),
        created_by: createdBy,
      }).select('id').single()
      if (error) throw error
      return json({ id: data.id, key })
    }
    if (input.action === 'reveal') {
      const { data, error } = await client.from('neurokore_licenses').select('key_cipher').eq('id', input.id).single()
      if (error) throw error
      const row = z.object({ key_cipher: z.string() }).parse(data)
      return json({ key: decryptKey(row.key_cipher, required('NEUROKORE_KEY_ENCRYPTION_SECRET')) })
    }
    if (input.action === 'revoke') {
      const { error } = await client.from('neurokore_licenses').update({ revoked_at: new Date().toISOString() }).eq('id', input.id)
      if (error) throw error
    } else {
      const { error } = await client.from('neurokore_devices').delete().eq('license_id', input.id)
      if (error) throw error
    }
    return json({ ok: true })
  } catch (error) {
    console.error('[neurokore-admin]', error)
    return json({ error: adminFailureMessage(error) }, 400)
  }
}
export async function GET(request: Request) {
  try {
    await limit(request, 'neurokore-admin-read', 30)
    await admin()
    const { data, error } = await db().from('neurokore_licenses')
      .select('id,email,tier,expires_at,revoked_at,created_at').order('created_at', { ascending: false }).limit(100)
    if (error) throw error
    return json({ licenses: data })
  } catch (error) {
    console.error('[neurokore-admin]', error)
    return json({ error: adminFailureMessage(error) }, 400)
  }
}
