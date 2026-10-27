import { z } from 'zod'
import { decryptKey } from '@/lib/neurokore/protocol'
import { db, json, limit, user } from '@/lib/neurokore/server'

export async function GET(request: Request) {
  // Authentication errors and licence configuration errors are distinct:
  // only the former means the customer must sign in again.
  let buyer: Awaited<ReturnType<typeof user>>
  try {
    buyer = await user()
  } catch {
    return json({ error: 'Please sign in to view your licences.' }, 401)
  }

  if (!process.env.NEUROKORE_KEY_ENCRYPTION_SECRET)
    return json({ error: 'Licence management is temporarily unavailable.' }, 503)

  try {
    await limit(request, 'neurokore-account', 30)
    const { data, error } = await db().from('plugin_licenses')
      .select('id,key_cipher,tier,expires_at,revoked_at,created_at,products(title,slug),plugin_devices(device,activated_at)')
      .eq('email', buyer.email).order('created_at', { ascending: false })
    if (error) throw error
    const rows = z.array(z.object({
      id: z.uuid(), key_cipher: z.string(), tier: z.enum(['alpha', 'full']),
      expires_at: z.string().nullable(), revoked_at: z.string().nullable(), created_at: z.string(),
      products: z.object({ title: z.string(), slug: z.string() }).nullable(),
      plugin_devices: z.array(z.object({ device: z.string(), activated_at: z.string() })),
    })).parse(data)
    const licenses = rows.map(({ key_cipher, products, ...row }) => ({
      ...row,
      key: decryptKey(key_cipher, process.env.NEUROKORE_KEY_ENCRYPTION_SECRET!),
      product_title: products?.title ?? 'Plugin',
      product_slug: products?.slug ?? null,
    }))
    return json({ email: buyer.email, licenses })
  } catch { return json({ error: 'Licence management is temporarily unavailable.' }, 503) }
}
