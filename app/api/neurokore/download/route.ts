export const runtime = 'nodejs'

/** Backwards-compatible alias for existing NEUROKORE links. */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const target = new URL('/api/plugins/neurokore/download', url.origin)
  target.search = url.search
  return new Response(null, { status: 307, headers: { Location: target.toString(), 'Cache-Control': 'no-store' } })
}
