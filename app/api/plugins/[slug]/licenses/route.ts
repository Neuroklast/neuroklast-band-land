import { z } from 'zod'
import { decryptKey, encryptKey, keyHash, newKey } from '@/lib/neurokore/protocol'
import { adminFailureMessage } from '@/lib/neurokore/admin-error'
import { admin, body, db, json, limit, required, sameOrigin } from '@/lib/neurokore/server'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ slug: string }>
}

const inputSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('issue'),
    email: z.email(),
    tier: z.enum(['alpha', 'full']).default('alpha'),
    days: z.number().int().min(1).max(3650).nullable().optional(),
  }).strict(),
  z.object({ action: z.literal('reveal'), id: z.uuid() }).strict(),
  z.object({ action: z.literal('revoke'), id: z.uuid() }).strict(),
  z.object({ action: z.literal('delete_sandbox'), id: z.uuid() }).strict(),
  z.object({ action: z.literal('reset'), id: z.uuid() }).strict(),
  z.object({ action: z.literal('remove_device'), id: z.uuid(), device: z.string().regex(/^v2:[a-f0-9]{64}$/) }).strict(),
])

async function loadProduct(client: ReturnType<typeof db>, productId: string) {
  const { data, error } = await client.from('products').select('id,slug,license_format')
    .eq('id', productId).maybeSingle()
  if (error) throw error
  return data
}

async function audit(
  client: ReturnType<typeof db>,
  actor: string,
  productId: string,
  action: string,
  target: string,
  detail: Record<string, unknown> = {},
) {
  try {
    await client.from('plugin_admin_audit').insert({ actor, product_id: productId, action, target, detail })
  } catch {
    // Audit is best-effort.
  }
}

export async function GET(request: Request, context: RouteContext) {
  try {
    await limit(request, 'plugin-licenses-read', 60)
    await admin()
    const { slug: id } = await context.params
    if (!z.uuid().safeParse(id).success) return json({ error: 'Plugin not found.' }, 404)
    const client = db()
    if (!(await loadProduct(client, id))) return json({ error: 'Plugin not found.' }, 404)
    const { data, error } = await client.from('plugin_licenses')
      .select('id,email,tier,license_format,expires_at,revoked_at,created_at,stripe_session,plugin_devices(device,activated_at)')
      .eq('product_id', id).order('created_at', { ascending: false }).limit(100)
    if (error) throw error
    return json({ licenses: data ?? [] })
  } catch (error) {
    return json({ error: adminFailureMessage(error) }, 400)
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    sameOrigin(request)
    await limit(request, 'plugin-licenses-write', 30)
    const actor = await admin()
    const { slug: productId } = await context.params
    if (!z.uuid().safeParse(productId).success) return json({ error: 'Plugin not found.' }, 404)
    const input = inputSchema.parse(await body(request))
    const client = db()
    const product = await loadProduct(client, productId)
    if (!product) return json({ error: 'Plugin not found.' }, 404)
    const secret = required('NEUROKORE_KEY_ENCRYPTION_SECRET')

    if (input.action === 'issue') {
      const key = newKey()
      const expires = input.days ? new Date(Date.now() + input.days * 86400000).toISOString() : null
      const { data, error } = await client.from('plugin_licenses').insert({
        product_id: productId,
        email: input.email.toLowerCase(),
        key_hash: keyHash(key),
        key_cipher: encryptKey(key, secret),
        tier: input.tier,
        license_format: product.license_format,
        expires_at: expires,
        created_by: actor,
      }).select('id').single()
      if (error) throw error
      await audit(client, actor, productId, 'license.issue', data.id, { tier: input.tier, days: input.days ?? null })
      return json({ id: data.id, key })
    }

    const { data: license, error: licenseError } = await client.from('plugin_licenses')
      .select('id,key_cipher').eq('id', input.id).eq('product_id', productId).maybeSingle()
    if (licenseError) throw licenseError
    if (!license) return json({ error: 'License not found.' }, 404)

    if (input.action === 'delete_sandbox') {
      const { data: deleted, error } = await client.rpc('plugin_delete_sandbox_license', {
        p_license: input.id, p_product: productId, p_actor: actor,
      })
      if (error) throw error
      if (deleted !== true) return json({ error: 'Sandbox licence could not be deleted.' }, 409)
      return json({ ok: true })
    }
    if (input.action === 'reveal') {
      return json({ key: decryptKey(license.key_cipher, secret) })
    }
    if (input.action === 'revoke') {
      const { error } = await client.from('plugin_licenses')
        .update({ revoked_at: new Date().toISOString() }).eq('id', input.id)
      if (error) throw error
      await audit(client, actor, productId, 'license.revoke', input.id)
      return json({ ok: true })
    }
    if (input.action === 'remove_device') {
      const { error } = await client.from('plugin_devices')
        .delete().eq('license_id', input.id).eq('device', input.device)
      if (error) throw error
      await audit(client, actor, productId, 'license.device.remove', input.id, { device: input.device })
      return json({ ok: true })
    }
    const { error } = await client.from('plugin_devices').delete().eq('license_id', input.id)
    if (error) throw error
    await audit(client, actor, productId, 'license.devices.reset', input.id)
    return json({ ok: true })
  } catch (error) {
    return json({ error: adminFailureMessage(error) }, 400)
  }
}

