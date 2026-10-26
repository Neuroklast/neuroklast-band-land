import { GetObjectCommand } from '@aws-sdk/client-s3'
import { requireAdmin } from '@/app/admin/_actions/auth'
import { MEDIA_BUCKET } from '@/lib/constants'
import { createR2S3Client } from '@/lib/r2-s3-client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Authenticated same-origin stream for temporary imports. Avoids requiring
 * cross-origin R2 GET CORS access from FFmpeg's browser-side encoder. */
export async function GET(request: Request): Promise<Response> {
  await requireAdmin()
  const key = new URL(request.url).searchParams.get('key') ?? ''
  if (!/^temporary\/background-video\/[a-f0-9-]{36}\/[a-f0-9]{64}\.(mp4|webm|mov)$/i.test(key)) {
    return new Response('Invalid temporary video key.', { status: 400 })
  }
  try {
    const result = await createR2S3Client().send(
      new GetObjectCommand({ Bucket: MEDIA_BUCKET, Key: key }),
    )
    if (!result.Body) return new Response('Video not found.', { status: 404 })
    return new Response(result.Body.transformToWebStream(), {
      headers: {
        'Content-Type': result.ContentType || 'application/octet-stream',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return new Response('Temporary video unavailable.', { status: 404 })
  }
}
