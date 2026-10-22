export const runtime = 'nodejs'

/** Backwards-compatible alias. 308 keeps the POST body for existing clients. */
export async function POST(request: Request) {
  const url = new URL(request.url)
  return new Response(null, {
    status: 308,
    headers: { Location: new URL('/api/plugins/neurokore/checkout', url.origin).toString(), 'Cache-Control': 'no-store' },
  })
}
