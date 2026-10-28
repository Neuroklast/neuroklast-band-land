import { afterEach, describe, expect, it } from 'vitest'
import { GET as getOAuthMetadata } from '@/app/.well-known/oauth-protected-resource/api/mcp/route'
import { authenticateMcp, McpAccessError } from '@/lib/mcp/server'

const originalSite = process.env.NEXT_PUBLIC_SITE_URL
const originalIssuer = process.env.NEXT_PUBLIC_SUPABASE_URL
const originalClientId = process.env.NEUROKLAST_MCP_CLIENT_ID

afterEach(() => {
  if (originalSite === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
  else process.env.NEXT_PUBLIC_SITE_URL = originalSite
  if (originalIssuer === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL
  else process.env.NEXT_PUBLIC_SUPABASE_URL = originalIssuer
  if (originalClientId === undefined) delete process.env.NEUROKLAST_MCP_CLIENT_ID
  else process.env.NEUROKLAST_MCP_CLIENT_ID = originalClientId
})

describe('private content MCP OAuth bootstrap', () => {
  it('advertises Supabase authorization without allowing anonymous content', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SITE_URL = 'https://neuroklast.net'
    delete process.env.NEUROKLAST_MCP_CLIENT_ID

    const metadata = getOAuthMetadata()
    expect(metadata.status).toBe(200)
    const json = await metadata.json()
    expect(json.resource).toBe('https://neuroklast.net/api/mcp')
    expect(json.authorization_servers).toEqual(['https://example.supabase.co/auth/v1'])
    expect(JSON.stringify(json)).not.toContain('service_role')

    await expect(authenticateMcp(new Request('https://neuroklast.net/api/mcp', {
      method: 'POST',
    }))).rejects.toMatchObject({ status: 503 } satisfies Partial<McpAccessError>)
  })

  it('does not advertise discovery without a configured issuer', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    expect(getOAuthMetadata().status).toBe(503)
  })
})
