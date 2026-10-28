import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import { requireAdmin } from '@/app/admin/_actions/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const ASSET_TYPES: Readonly<Record<string, string>> = Object.freeze({
  'ffmpeg.js': 'application/javascript; charset=utf-8',
  '814.ffmpeg.js': 'application/javascript; charset=utf-8',
  'ffmpeg-core.js': 'application/javascript; charset=utf-8',
  'ffmpeg-core.wasm': 'application/wasm',
})

const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Vary': 'Cookie',
}

/**
 * This route, not the page-level /admin proxy, enforces authorization.
 * Binary assets must never be placed in public/ or on a public CDN.
 * Streaming avoids Vercel's non-streamed response size limit for WASM.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ asset: string }> },
): Promise<Response> {
  try {
    await requireAdmin()
  } catch {
    return new Response('Forbidden', { status: 403, headers: PRIVATE_HEADERS })
  }

  const { asset } = await params
  const contentType = Object.hasOwn(ASSET_TYPES, asset) ? ASSET_TYPES[asset] : undefined
  if (!contentType) {
    return new Response('Not found', { status: 404, headers: PRIVATE_HEADERS })
  }

  const path = join(process.cwd(), '.ffmpeg-admin-assets', asset)
  try {
    const info = await stat(path)
    if (!info.isFile()) throw new Error('Not a file')
    const stream = Readable.toWeb(createReadStream(path)) as ReadableStream<Uint8Array>
    return new Response(stream, {
      headers: {
        ...PRIVATE_HEADERS,
        'Content-Type': contentType,
        'Content-Length': String(info.size),
      },
    })
  } catch {
    return new Response('Not found', { status: 404, headers: PRIVATE_HEADERS })
  }
}
