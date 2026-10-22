import { z } from 'zod'
import { MEDIA_BUCKET } from '@/lib/constants'
import { db, json, limit } from '@/lib/neurokore/server'
import {
  artifactReady,
  pickArtifact,
  PLATFORMS,
  RELEASE_CHANNELS,
  safeReleaseStorageKey,
  slugSchema,
  type Platform,
} from '@/lib/plugins/releases'
import { r2StorageProvider } from '@/lib/storage/r2'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ slug: string }>
}

const querySchema = z.object({
  platform: z.enum(PLATFORMS),
  channel: z.enum(RELEASE_CHANNELS).optional(),
})

const productSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  default_channel: z.enum(RELEASE_CHANNELS),
  demo_downloads_enabled: z.boolean(),
  pricing_mode: z.enum(['paid', 'free']),
})

const releaseSchema = z.object({
  id: z.uuid(),
  version: z.string(),
  channel: z.string(),
  title: z.string().nullable(),
})

const artifactSchema = z.object({
  id: z.uuid(),
  platform: z.enum(PLATFORMS),
  package_type: z.enum(['installer', 'vst3', 'au', 'standalone', 'bundle']),
  filename: z.string(),
  storage_key: z.string(),
  filesize_bytes: z.number(),
  sha256: z.string(),
  validation_status: z.enum(['pending', 'validated', 'failed']),
})

const SIGNED_URL_SECONDS = 120

/** Anonymous public download for one plugin. Resolves published artifacts
 * server-side and redirects to a short-lived R2 URL; no binary passes through Vercel. */
export async function GET(request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params
    if (!slugSchema.safeParse(slug).success) return json({ error: 'Unknown plugin.' }, 404)
    const url = new URL(request.url)
    const parsed = querySchema.safeParse({
      platform: url.searchParams.get('platform'),
      channel: url.searchParams.get('channel') ?? undefined,
    })
    if (!parsed.success) return json({ error: 'Unknown platform or channel.' }, 400)
    await limit(request, 'plugin-download', 30)

    const client = db()
    const productResult = await client.from('products')
      .select('id,slug,default_channel,demo_downloads_enabled,pricing_mode')
      .eq('slug', slug).eq('kind', 'plugin').eq('active', true).maybeSingle()
    if (productResult.error) return json({ error: 'Downloads are temporarily unavailable.' }, 503)
    if (!productResult.data) return json({ error: 'Plugin not found.' }, 404)
    const product = productSchema.parse(productResult.data)
    if (!product.demo_downloads_enabled) {
      return json({ error: 'Downloads are not open for this plugin.' }, 403)
    }
    const channel = parsed.data.channel ?? product.default_channel

    const releaseResult = await client
      .from('plugin_releases')
      .select('id,version,channel,title')
      .eq('product_id', product.id)
      .eq('status', 'published')
      .eq('channel', channel)
      .is('withdrawn_at', null)
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (releaseResult.error) return json({ error: 'Downloads are temporarily unavailable.' }, 503)
    if (!releaseResult.data) return json({ error: 'No published build for this platform yet.' }, 404)
    const release = releaseSchema.parse(releaseResult.data)

    const artifactsResult = await client
      .from('plugin_release_artifacts')
      .select('id,platform,package_type,filename,storage_key,filesize_bytes,sha256,validation_status')
      .eq('release_id', release.id)
    if (artifactsResult.error) return json({ error: 'Downloads are temporarily unavailable.' }, 503)
    const artifacts = z.array(artifactSchema).parse(artifactsResult.data ?? [])
    const chosen = pickArtifact(artifacts, parsed.data.platform as Platform)
    if (!chosen) return json({ error: 'No published build for this platform yet.' }, 404)
    if (!safeReleaseStorageKey(chosen.storage_key) || !artifactReady(chosen)) {
      return json({ error: 'This build is not available right now.' }, 409)
    }

    try {
      await client.from('plugin_download_events').insert({
        product_id: product.id,
        release_id: release.id,
        artifact_id: chosen.id,
        platform: parsed.data.platform,
        channel,
      })
    } catch {
      // A failed counter must never block a download.
    }

    const signed = await r2StorageProvider.createSignedDownloadUrl(MEDIA_BUCKET, chosen.storage_key, SIGNED_URL_SECONDS)
    return new Response(null, {
      status: 307,
      headers: {
        Location: signed,
        'Cache-Control': 'no-store',
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return json({ error: 'Download unavailable. Please try again later.' }, 503)
  }
}
