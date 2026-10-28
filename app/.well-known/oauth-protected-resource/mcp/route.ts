// RFC 9728 metadata for the protected MCP resource.
// OAuth discovery is delegated to Supabase Auth. Never expose credentials here.
export const dynamic = 'force-dynamic'

export function GET() {
  const issuer = process.env.NEXT_PUBLIC_SUPABASE_URL
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://neuroklast.net'
  if (!issuer || !process.env.NEUROKLAST_MCP_CLIENT_ID) {
    return Response.json({ error: 'MCP integration not configured' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
  return Response.json({
    resource: new URL('/api/mcp', site).toString(),
    authorization_servers: [new URL('/auth/v1', issuer).toString()],
    bearer_methods_supported: ['header'],
  }, { headers: { 'Cache-Control': 'no-store' } })
}
