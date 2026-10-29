import { z } from 'zod'
import { MEDIA_BUCKET } from '@/lib/constants'
import { db, json, limit } from '@/lib/neurokore/server'
import {
  artifactReady,
  pickArtifact,
  PLATFORMS,
  PACKAGE_TYPES,
  RELEASE_CHANNELS,
  safeReleaseStorageKey,
  slugSchema,
  type Platform,
} from '@/lib/plugins/releases'
import { r2StorageProvider } from '@/lib/storage/r2'
import { comparePublicReleaseVersions, pluginGithubArtifactUrl } from '@/lib/plugins/github-releases'
import { loadNeurokoreGitHubReleases, loadPluginGitHubReleases } from '@/lib/plugins/github-releases-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ slug: string }>
}

const querySchema = z.object({
  platform: z.enum(PLATFORMS),
  channel: z.enum(RELEASE_CHANNELS).optional(),
  package: z.enum(PACKAGE_TYPES).optional(),
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
  channel: z.enum(RELEASE_CHANNELS),
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

function downloadRedirect(location: string): Response {
  return new Response(null, { status: 307, headers: { Location: location, 'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' } })
}

/**
 * Resolves enabled downloads to R2 or official product-specific binary release assets.
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params
    if (!slugSchema.safeParse(slug).success) return json({ error: 'Unknown plugin.' }, 404)
    const url = new URL(request.url)
    const parsed = querySchema.safeParse({
      platform: url.searchParams.get('platform'),
      channel: url.searchParams.get('channel') ?? undefined,
      package: url.searchParams.get('package') ?? undefined,
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
    const release = releaseResult.data ? releaseSchema.parse(releaseResult.data) : null

    const artifactsResult = release ? await client
      .from('plugin_release_artifacts')
      .select('id,platform,package_type,filename,storage_key,filesize_bytes,sha256,validation_status')
      .eq('release_id', release.id) : { data: [], error: null }
    if (artifactsResult.error) return json({ error: 'Downloads are temporarily unavailable.' }, 503)
    const artifacts = z.array(artifactSchema).parse(artifactsResult.data ?? [])
    const candidates = parsed.data.package ? artifacts.filter(item => item.package_type === parsed.data.package) : artifacts
    const chosen = pickArtifact(candidates, parsed.data.platform as Platform)
    if ((product.slug === 'neurokore' || product.slug === 'neurometer') && parsed.data.platform === 'windows-x64') {
      const official = product.slug === 'neurokore'
        ? await loadNeurokoreGitHubReleases() : await loadPluginGitHubReleases('neurometer')
      const github = official.find(item => item.channel === channel
        && pluginGithubArtifactUrl(product.slug as 'neurokore' | 'neurometer', item, parsed.data.platform, parsed.data.package))
      if (github && (!chosen || !release || comparePublicReleaseVersions(github, release) > 0)) {
        const url = pluginGithubArtifactUrl(product.slug as 'neurokore' | 'neurometer', github, parsed.data.platform, parsed.data.package)
        if (url) return downloadRedirect(url)
      }
    }
    if (!release) return json({ error: 'No published build for this platform yet.' }, 404)
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
    return downloadRedirect(signed)
  } catch {
    return json({ error: 'Download unavailable. Please try again later.' }, 503)
  }
}
