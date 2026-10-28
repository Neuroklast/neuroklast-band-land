import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockGetUser, mockActiveClient, mockVerifyGrant, mockRpc, mockMaybeSingle,
  mockLimit,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockActiveClient: vi.fn(),
  mockVerifyGrant: vi.fn(),
  mockRpc: vi.fn(),
  mockMaybeSingle: vi.fn(),
  mockLimit: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ auth: { getUser: mockGetUser } }),
}))
vi.mock('@/lib/mcp/client-registry', () => ({
  getActiveMcpClient: mockActiveClient,
}))
vi.mock('@/lib/mcp/mfa-grants', () => ({
  verifyMcpOAuthMfaGrant: mockVerifyGrant,
}))
vi.mock('@/lib/supabaseAdmin', () => {
  const query: Record<string, unknown> = {}
  query.select = () => query
  query.eq = () => query
  query.maybeSingle = mockMaybeSingle
  return { createAdminClient: () => ({ from: () => query, rpc: mockRpc }) }
})
vi.mock('@/lib/rate-limit', () => ({
  consumeRateLimitForRequest: mockLimit,
}))

import { authenticateMcp, McpAccessError } from '@/lib/mcp/server'

const userId = '00000000-0000-4000-8000-000000000001'
const sessionId = '00000000-0000-4000-8000-000000000002'
const clientId = '27373656-347b-49df-a452-550198edc379'
const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function oauthRequest(overrides: Record<string, unknown> = {}) {
  const payload = { sub: userId, session_id: sessionId, client_id: clientId, aal: 'aal1', ...overrides }
  const token = [
    Buffer.from('{"alg":"HS256"}').toString('base64url'),
    Buffer.from(JSON.stringify(payload)).toString('base64url'),
    'signature',
  ].join('.')
  return new Request('https://neuroklast.net/api/mcp', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token },
  })
}

describe('Supabase OAuth MCP token MFA attestation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
    mockGetUser.mockResolvedValue({ data: { user: { id: userId } }, error: null })
    mockActiveClient.mockResolvedValue({ client_id: clientId, enabled: true })
    mockVerifyGrant.mockResolvedValue(true)
    mockMaybeSingle.mockResolvedValue({ data: { role: 'admin' }, error: null })
    mockLimit.mockResolvedValue({ allowed: true })
  })

  it('accepts OAuth AAL1 only with an actual server-side MFA-approved grant', async () => {
    expect(await authenticateMcp(oauthRequest())).toEqual({ userId, clientId })
    expect(mockVerifyGrant).toHaveBeenCalledWith(userId, clientId, sessionId)
  })

  it('rejects OAuth AAL1 if no MFA attestation exists', async () => {
    mockVerifyGrant.mockResolvedValue(false)
    await expect(authenticateMcp(oauthRequest())).rejects.toMatchObject({
      status: 403,
      message: 'OAuth session requires MFA-approved client consent',
    } satisfies Partial<McpAccessError>)
  })

  it('still requires an approved OAuth session even if token claims say AAL2', async () => {
    mockVerifyGrant.mockResolvedValue(false)
    await expect(authenticateMcp(oauthRequest({ aal: 'aal2' }))).rejects.toMatchObject({ status: 403 })
  })

  it('denies a missing or forged OAuth session claim', async () => {
    await expect(authenticateMcp(oauthRequest({ session_id: undefined }))).rejects.toMatchObject({ status: 403 })
    expect(mockVerifyGrant).not.toHaveBeenCalled()
  })

  it('never accepts an OAuth client absent from the allowlist', async () => {
    mockActiveClient.mockResolvedValue(null)
    await expect(authenticateMcp(oauthRequest())).rejects.toMatchObject({ status: 403 })
  })

  it('fails closed when OAuth validation cannot reach the server database', async () => {
    mockVerifyGrant.mockRejectedValue(new Error('database unavailable'))
    await expect(authenticateMcp(oauthRequest())).rejects.toMatchObject({ status: 503 })
  })

  it('never grants access to non-admin accounts', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { role: 'customer' }, error: null })
    await expect(authenticateMcp(oauthRequest())).rejects.toMatchObject({ status: 403 })
    expect(mockVerifyGrant).not.toHaveBeenCalled()
  })
})
