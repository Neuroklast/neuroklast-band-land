import { z } from 'zod'
import { MEDIA_BUCKET } from '@/lib/constants'
import { db, json, limit } from '@/lib/neurokore/server'
import {
  artifactReady,
  pickArtifact,
  PLATFORMS,
  RELEASE_CHANNELS,
  safeReleaseStorageKey,
  type Platform,
} from '@/lib/neurokore/releases'
import { r2StorageProvider } from '@/lib/storage/r2'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const querySchema = z.object({
  platform: z.enum(PLATFORMS),
  channel: z.enum(RELEASE_CHANNELS).default('stable'),
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

/** Anonymous public download. Resolves published artifacts server-side and
 * redirects to a short-lived R2 URL; binary bytes never pass through Vercel. */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const parsed = querySchema.safeParse({
      platform: url.searchParams.get('platform'),
      channel: url.searchParams.get('channel') ?? 'stable',
    })
    if (!parsed.success) return json({ error: 'Unknown platform or channel.' }, 400)
    const { platform, channel } = parsed.data
    await limit(request, 'neurokore-download', 30)

    const client = db()
    const releaseResult = await client
      .from('neurokore_releases')
      .select('id,version,channel,title')
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
      .from('neurokore_release_artifacts')
      .select('id,platform,package_type,filename,storage_key,filesize_bytes,sha256,validation_status')
      .eq('release_id', release.id)
    if (artifactsResult.error) return json({ error: 'Downloads are temporarily unavailable.' }, 503)
    const artifacts = z.array(artifactSchema).parse(artifactsResult.data ?? [])
    const chosen = pickArtifact(artifacts, platform as Platform)
    if (!chosen) return json({ error: 'No published build for this platform yet.' }, 404)
    if (!safeReleaseStorageKey(chosen.storage_key) || !artifactReady(chosen)) {
      return json({ error: 'This build is not available right now.' }, 409)
    }

    // Statistics only: no account, license or buyer reference is stored.
    try {
      await client.from('neurokore_download_events').insert({
        release_id: release.id,
        artifact_id: chosen.id,
        platform,
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
