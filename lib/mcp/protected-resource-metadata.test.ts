import { afterEach, describe, expect, it, vi } from 'vitest'
import { GET as getApiMcpMetadata } from '@/app/.well-known/oauth-protected-resource/api/mcp/route'
import { GET as getMcpMetadata } from '@/app/.well-known/oauth-protected-resource/mcp/route'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('MCP OAuth discovery aliases', () => {
  it('advertises identical, uncacheable metadata on both routes', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://neuroklast.net')

    for (const handler of [getApiMcpMetadata, getMcpMetadata]) {
      const response = handler()
      expect(response.status).toBe(200)
      expect(response.headers.get('cache-control')).toBe('no-store')
      expect(await response.json()).toEqual({
        resource: 'https://neuroklast.net/api/mcp',
        authorization_servers: ['https://example.supabase.co/auth/v1'],
        bearer_methods_supported: ['header'],
      })
    }
  })

  it('returns the same 503 when the authorization server is not configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    for (const handler of [getApiMcpMetadata, getMcpMetadata]) {
      const response = handler()
      expect(response.status).toBe(503)
      expect(response.headers.get('cache-control')).toBe('no-store')
      expect(await response.json()).toEqual({ error: 'MCP integration not configured' })
    }
  })
})
