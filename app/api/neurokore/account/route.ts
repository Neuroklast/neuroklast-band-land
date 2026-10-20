
import { z } from 'zod'
import { decryptKey } from '@/lib/neurokore/protocol'
import { db, json, limit, required, user } from '@/lib/neurokore/server'
export async function GET(request: Request) {
  try {
    await limit(request, 'neurokore-account', 30)
    const buyer = await user()
    const { data, error } = await db().from('neurokore_licenses')
      .select('id,key_cipher,tier,expires_at,revoked_at,created_at,neurokore_devices(device,activated_at)')
      .eq('email', buyer.email).order('created_at', { ascending: false })
    if (error) throw error
    const rows = z.array(z.object({
      id: z.uuid(), key_cipher: z.string(), tier: z.enum(['alpha', 'full']),
      expires_at: z.string().nullable(), revoked_at: z.string().nullable(), created_at: z.string(),
      neurokore_devices: z.array(z.object({ device: z.string(), activated_at: z.string() })),
    })).parse(data)
    const licenses = rows.map(({ key_cipher, ...row }) => ({
      ...row, key: decryptKey(key_cipher, required('NEUROKORE_KEY_ENCRYPTION_SECRET')),
    }))
    const active = rows.some(row => !row.revoked_at && (!row.expires_at || Date.parse(row.expires_at) > Date.now()))
    return json({ email: buyer.email, licenses, download: active ? (process.env.NEUROKORE_DOWNLOAD_URL || null) : null })
  } catch { return json({ error: 'Please sign in to view your licenses.' }, 401) }
}
