import { describe, expect, it } from 'vitest'
import { GET } from '@/app/oauth/consent/route'
import { isValidOAuthAuthorizationId } from '@/lib/mcp/authorization-id'

const opaqueId = '7axm7dof5dljo6httqpnyzh4bmgwo52x'

describe('Supabase OAuth consent routing', () => {
  it('accepts actual Supabase opaque authorization IDs containing non-hex letters', () => {
    expect(isValidOAuthAuthorizationId(opaqueId)).toBe(true)
    expect(isValidOAuthAuthorizationId('00000000-0000-4000-8000-000000000001')).toBe(true)
  })

  it('redirects current Supabase /oauth/consent URLs to the protected admin consent page', () => {
    const response = GET(new Request(
      'https://neuroklast.net/oauth/consent?authorization_id=' + opaqueId,
    ))
    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toBe(
      'https://neuroklast.net/admin/oauth/consent?authorization_id=' + opaqueId,
    )
    expect(response.headers.get('cache-control')).toBe('no-store')
  })

  it('does not pass arbitrary URL parameters into the protected consent flow', () => {
    const response = GET(new Request(
      'https://neuroklast.net/oauth/consent?authorization_id=' + opaqueId +
      '&redirect=https%3A%2F%2Fevil.example%2F',
    ))
    const location = response.headers.get('location')
    expect(location).not.toContain('evil.example')
    expect(location).toContain('authorization_id=' + opaqueId)
  })

  it.each([
    '',
    'short',
    '../../admin',
    'a'.repeat(129),
    '12345%0AInjected',
    'http://evil.example',
    'a'.repeat(31) + '!',
  ])('rejects malformed OAuth authorization IDs: %s', (value) => {
    const url = 'https://neuroklast.net/oauth/consent?authorization_id=' + encodeURIComponent(value)
    expect(GET(new Request(url)).status).toBe(400)
    expect(isValidOAuthAuthorizationId(value)).toBe(false)
  })

  it('rejects a missing authorization ID without redirecting', () => {
    const response = GET(new Request('https://neuroklast.net/oauth/consent'))
    expect(response.status).toBe(400)
    expect(response.headers.get('location')).toBeNull()
  })
})
