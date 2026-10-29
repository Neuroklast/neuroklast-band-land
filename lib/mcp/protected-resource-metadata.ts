/**
 * RFC 9728 metadata for the MCP resource.
 *
 * Both registered discovery paths must advertise the same protected endpoint.
 * Discovery remains available before client registration, while authenticated
 * content requests continue to fail closed in the MCP server.
 */
export function protectedMcpResourceMetadata(): Response {
  const issuer = process.env.NEXT_PUBLIC_SUPABASE_URL
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://neuroklast.net'

  if (!issuer) {
    return Response.json(
      { error: 'MCP integration not configured' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  return Response.json(
    {
      resource: new URL('/api/mcp', site).toString(),
      authorization_servers: [new URL('/auth/v1', issuer).toString()],
      bearer_methods_supported: ['header'],
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
