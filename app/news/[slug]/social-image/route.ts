import sharp from 'sharp'
import { createPublicClient } from '@/lib/supabaseServer'
import { newsR2SocialSource } from '@/lib/news-social-image'

export const runtime = 'nodejs'
export const revalidate = 3600

const IMAGE_WIDTH = 1200
const IMAGE_HEIGHT = 630
const MAX_SOURCE_BYTES = 8_000_000

/**
 * A first-party JPEG share image of the actual article cover.
 * Social crawlers should not have to understand WebP or load a third-party R2 URL.
 * The original is fetched only from the configured public R2 origin, never
 * from an arbitrary cover_url (SSRF protection).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params
  if (!slug || slug.length > 200) return new Response('Not found', { status: 404 })

  const { data, error } = await createPublicClient()
    .from('news_posts')
    .select('cover_storage_path, cover_url')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle()
  if (error || !data) return new Response('Not found', { status: 404 })

  const source = newsR2SocialSource(data.cover_storage_path, data.cover_url)
  if (!source) return new Response('Cover not available', { status: 404 })

  try {
    const remote = await fetch(source, {
      redirect: 'error',
      signal: AbortSignal.timeout(6500),
      cache: 'force-cache',
    })
    if (!remote.ok || !/^image\/(jpeg|png|webp|avif)(?:\s*;|$)/i.test(remote.headers.get('content-type') ?? '')) {
      return new Response('Cover not available', { status: 404 })
    }
    const length = Number(remote.headers.get('content-length') ?? 0)
    if (length > MAX_SOURCE_BYTES) return new Response('Cover too large', { status: 413 })
    const bytes = new Uint8Array(await remote.arrayBuffer())
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_SOURCE_BYTES) {
      return new Response('Cover too large', { status: 413 })
    }
    const image = await sharp(bytes, { limitInputPixels: 24_000_000 })
      .rotate()
      .resize(IMAGE_WIDTH, IMAGE_HEIGHT, {
        fit: 'contain',
        background: '#080808',
      })
      .flatten({ background: '#080808' })
      .jpeg({ quality: 84, mozjpeg: true })
      .toBuffer()
    return new Response(new Uint8Array(image), {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': String(image.byteLength),
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return new Response('Cover temporarily unavailable', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}
