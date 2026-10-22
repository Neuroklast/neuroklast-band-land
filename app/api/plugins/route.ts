import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { adminFailureMessage } from '@/lib/neurokore/admin-error'
import { admin, body, db, json, limit, required, sameOrigin } from '@/lib/neurokore/server'
import { generateSigningKeyPair, normalizeSigningPem, signingPublicHex } from '@/lib/neurokore/protocol'
import { encryptSigningKey } from '@/lib/plugins/signing'
import { RELEASE_CHANNELS, slugSchema } from '@/lib/plugins/releases'
import { MEDIA_BUCKET } from '@/lib/constants'
import { r2StorageProvider } from '@/lib/storage/r2'

export const runtime = 'nodejs'

const featureSchema = z.object({ title: z.string().trim().min(1).max(120), body: z.string().trim().max(1000) })
const requirementSchema = z.string().trim().min(1).max(300)
const mediaSchema = z.object({ kind: z.enum(['image', 'video', 'audio']), url: z.url() })

const settings = {
  title: z.string().trim().min(1).max(200),
  slug: slugSchema,
  short_description: z.string().trim().max(500).nullable(),
  description: z.string().trim().max(8000).nullable(),
  features: z.array(featureSchema).max(24),
  system_requirements: z.array(requirementSchema).max(24),
  media: z.array(mediaSchema).max(24),
  default_channel: z.enum(RELEASE_CHANNELS),
  pricing_mode: z.enum(['paid', 'free']),
  sales_enabled: z.boolean(),
  demo_downloads_enabled: z.boolean(),
  license_required: z.boolean(),
  license_format: z.enum(['v2', 'v3']),
  stripe_price_id: z.string().trim().max(255).nullable(),
  display_order: z.number().int().min(0).max(9999),
  active: z.boolean(),
}

const inputSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('create'),
    slug: slugSchema,
    title: z.string().trim().min(1).max(200),
    pricing_mode: z.enum(['paid', 'free']).default('paid'),
  }).strict(),
  z.object({ action: z.literal('update'), id: z.uuid(), ...settings }).strict(),
  z.object({ action: z.literal('set_active'), id: z.uuid(), active: z.boolean() }).strict(),
  z.object({ action: z.literal('delete_product'), id: z.uuid() }).strict(),
  z.object({ action: z.literal('generate_key'), id: z.uuid() }).strict(),
  z.object({ action: z.literal('import_key'), id: z.uuid(), private_pem: z.string().min(32).max(4096) }).strict(),
])

async function audit(
  client: ReturnType<typeof db>,
  actor: string,
  productId: string,
  action: string,
  detail: Record<string, unknown> = {},
) {
  try {
    await client.from('plugin_admin_audit').insert({ actor, product_id: productId, action, target: productId, detail })
  } catch {
    // Audit is best-effort; the primary mutation already succeeded.
  }
}

function revalidateProductSurface(slug: string) {
  revalidateTag('homepage-site-data', 'max')
  revalidatePath('/plugins')
  revalidatePath('/api/sitemap')
  revalidatePath('/sitemap.xml')
  if (slug) {
    revalidatePath('/plugins/' + slug)
    revalidatePath('/plugins/' + slug + '/opengraph-image')
    revalidatePath('/plugins/' + slug + '/download')
  }
  revalidatePath('/')
}

const productColumns =
  'id,slug,kind,title,short_description,description,features,system_requirements,media,default_channel,pricing_mode,sales_enabled,demo_downloads_enabled,license_required,license_format,display_order,active,created_at'

export async function GET(request: Request) {
  try {
    await limit(request, 'plugins-read', 60)
    await admin()
    const client = db()
    const { data, error } = await client.from('products').select(productColumns)
      .order('display_order', { ascending: true }).order('title')
    if (error) throw error
    const products = data ?? []
    if (products.length === 0) return json({ products: [] })
    const ids = products.map((product) => product.id)
    const [secrets, releases, licenses] = await Promise.all([
      client.from('plugin_product_secrets').select('product_id,stripe_price_id,signing_public_key_hex,signing_key_cipher').in('product_id', ids),
      client.from('plugin_releases').select('product_id,status').in('product_id', ids),
      client.from('plugin_licenses').select('product_id').in('product_id', ids),
    ])
    const secretRows = secrets.error ? [] : secrets.data ?? []
    const releaseRows = releases.error ? [] : releases.data ?? []
    const licenseRows = licenses.error ? [] : licenses.data ?? []
    return json({
      products: products.map((product) => {
        const secret = secretRows.find((row) => row.product_id === product.id)
        return {
          ...product,
          stripe_price_id: secret?.stripe_price_id ?? null,
          signing_public_key_hex: secret?.signing_public_key_hex ?? null,
          has_signing_key: Boolean(secret?.signing_key_cipher),
          release_count: releaseRows.filter((row) => row.product_id === product.id).length,
          published_count: releaseRows.filter((row) => row.product_id === product.id && row.status === 'published').length,
          license_count: licenseRows.filter((row) => row.product_id === product.id).length,
        }
      }),
    })
  } catch (error) {
    return json({ error: adminFailureMessage(error) }, 400)
  }
}

export async function POST(request: Request) {
  try {
    sameOrigin(request)
    await limit(request, 'plugins-write', 30)
    const actor = await admin()
    const input = inputSchema.parse(await body(request))
    const client = db()

    if (input.action === 'create') {
      const { data, error } = await client.from('products').insert({
        kind: 'plugin',
        slug: input.slug,
        title: input.title,
        pricing_mode: input.pricing_mode,
        license_required: input.pricing_mode === 'paid',
        active: false,
        license_format: 'v3',
      }).select('id').single()
      if (error) throw error
      await audit(client, actor, data.id, 'product.create', { slug: input.slug })
      return json({ id: data.id })
    }

    if (input.action === 'update') {
      const { stripe_price_id, ...product } = input
      const { id } = product
      const existing = await client.from('products').select('slug,kind').eq('id', id).maybeSingle()
      if (existing.error) throw existing.error
      if (!existing.data) return json({ error: 'Plugin not found.' }, 404)
      if (existing.data.slug !== product.slug) {
        if (existing.data.slug === 'neurokore') {
          return json({ error: 'The NEUROKORE address is fixed because the plugin depends on it.' }, 409)
        }
        const releases = await client.from('plugin_releases')
          .select('id', { count: 'exact', head: true }).eq('product_id', id)
        if (releases.error) throw releases.error
        if ((releases.count ?? 0) > 0) {
          return json({ error: 'The address cannot change after a version exists.' }, 409)
        }
      }
      const patch = {
        kind: 'plugin',
        title: product.title,
        slug: product.slug,
        short_description: product.short_description,
        description: product.description,
        features: product.features,
        system_requirements: product.system_requirements,
        media: product.media,
        default_channel: product.default_channel,
        pricing_mode: product.pricing_mode,
        sales_enabled: product.pricing_mode === 'free' ? false : product.sales_enabled,
        demo_downloads_enabled: product.demo_downloads_enabled,
        license_required: product.pricing_mode === 'free' ? false : product.license_required,
        license_format: product.license_format,
        display_order: product.display_order,
        active: product.active,
      }
      const { error } = await client.from('products').update(patch).eq('id', id)
      if (error) throw error
      const { error: secretError } = await client.from('plugin_product_secrets')
        .upsert({ product_id: id, stripe_price_id: stripe_price_id || null, updated_at: new Date().toISOString() },
          { onConflict: 'product_id' })
      if (secretError) throw secretError
      await audit(client, actor, id, 'product.update', { pricing_mode: input.pricing_mode, active: input.active })
      revalidateProductSurface(product.slug)
      return json({ ok: true })
    }

    if (input.action === 'set_active') {
      const existing = await client.from('products').select('slug').eq('id', input.id).maybeSingle()
      if (existing.error) throw existing.error
      if (!existing.data) return json({ error: 'Product not found.' }, 404)
      const { error } = await client.from('products').update({ active: input.active }).eq('id', input.id)
      if (error) throw error
      await audit(client, actor, input.id, 'product.visibility', { active: input.active })
      revalidateProductSurface(existing.data.slug)
      return json({ ok: true, active: input.active })
    }

    const product = await client.from('products').select('id,slug,title').eq('id', input.id)
      .maybeSingle()
    if (product.error) throw product.error
    if (!product.data) return json({ error: 'Plugin not found.' }, 404)

    if (input.action === 'delete_product') {
      const { data: releases, error: releasesError } = await client.from('plugin_releases')
        .select('id').eq('product_id', input.id)
      if (releasesError) throw releasesError
      const releaseIds = (releases ?? []).map((release) => release.id)
      let storageKeys: string[] = []
      if (releaseIds.length > 0) {
        const { data: artifacts } = await client.from('plugin_release_artifacts')
          .select('storage_key').in('release_id', releaseIds)
        storageKeys = (artifacts ?? []).map((artifact) => artifact.storage_key)
      }
      // The RPC enforces "hidden and no paid orders" before anything is removed.
      const { error } = await client.rpc('plugin_delete_product', { p_product: input.id })
      if (error) throw error
      for (const key of storageKeys) {
        try {
          await r2StorageProvider.deleteObject(MEDIA_BUCKET, key)
        } catch {
          // The product is gone; an orphaned object must not fail the request.
        }
      }
      revalidateProductSurface(product.data.slug ?? '')
      return json({ ok: true })
    }

    if (input.action === 'generate_key') {
      if (product.data.slug === 'neurokore') {
        return json({
          error: 'NEUROKORE must keep the key its shipped build verifies. Import the existing private key instead.',
        }, 409)
      }
      const { privatePem, publicHex } = generateSigningKeyPair()
      const cipher = encryptSigningKey(privatePem, required('NEUROKORE_KEY_ENCRYPTION_SECRET'), product.data.slug)
      const { error } = await client.from('plugin_product_secrets').upsert({
        product_id: product.data.id,
        signing_key_cipher: cipher,
        signing_public_key_hex: publicHex,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'product_id' })
      if (error) throw error
      await audit(client, actor, product.data.id, 'product.key.generate', { slug: product.data.slug })
      return json({ public_key_hex: publicHex })
    }

    const pem = normalizeSigningPem(input.private_pem)
    const publicHex = signingPublicHex(pem)
    const cipher = encryptSigningKey(pem, required('NEUROKORE_KEY_ENCRYPTION_SECRET'), product.data.slug)
    const { error } = await client.from('plugin_product_secrets').upsert({
      product_id: product.data.id,
      signing_key_cipher: cipher,
      signing_public_key_hex: publicHex,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'product_id' })
    if (error) throw error
    await audit(client, actor, product.data.id, 'product.key.import', { slug: product.data.slug })
    return json({ public_key_hex: publicHex })
  } catch (error) {
    console.error('[plugins-api]', error)
    return json({ error: adminFailureMessage(error) }, 400)
  }
}



