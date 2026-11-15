import { describe, expect, it, beforeEach, vi } from 'vitest'
import type { NextRequest } from 'next/server'

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> }
type AuthHeaders = Record<string, string>

const {
  mockGetUser,
  mockSingle,
  mockGetAssurance,
  mockCookiesToSet,
  mockAuthHeaders,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockSingle: vi.fn(),
  mockGetAssurance: vi.fn(),
  mockCookiesToSet: [] as CookieToSet[],
  mockAuthHeaders: {} as AuthHeaders,
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(
    (
      _url: string,
      _anonKey: string,
      options: { cookies: { setAll: (cookiesToSet: CookieToSet[], headers: AuthHeaders) => void } },
    ) => ({
      auth: {
        mfa: { getAuthenticatorAssuranceLevel: mockGetAssurance },
        getUser: async () => {
          if (mockCookiesToSet.length > 0) {
            options.cookies.setAll(mockCookiesToSet, mockAuthHeaders)
          }
          return mockGetUser()
        },
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: mockSingle,
          }),
        }),
      }),
    }),
  ),
}))

import { proxy } from '@/proxy'

function createRequest(
  pathname: string,
  init?: { headers?: Record<string, string>; url?: string; method?: string },
): NextRequest {
  const cookieJar = new Map<string, string>()
  return {
    nextUrl: { pathname, search: new URL(init?.url ?? `https://example.com${pathname}`).search },
    url: init?.url ?? `https://example.com${pathname}`,
    method: init?.method ?? 'GET',
    headers: new Headers(init?.headers),
    cookies: {
      getAll: () => Array.from(cookieJar.entries()).map(([name, value]) => ({ name, value })),
      set: (name: string, value: string) => cookieJar.set(name, value),
    },
  } as unknown as NextRequest
}

describe('middleware admin auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCookiesToSet.length = 0
    for (const key of Object.keys(mockAuthHeaders)) {
      delete mockAuthHeaders[key]
    }
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    mockGetAssurance.mockResolvedValue({ data: { currentLevel: 'aal2', nextLevel: 'aal2' }, error: null })
  })

  it('keeps refreshed cookies on login redirect when auth fails', async () => {
    mockCookiesToSet.push({
      name: 'sb-access-token',
      value: 'fresh-token',
      options: { path: '/', httpOnly: true },
    })
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: new Error('invalid session'),
    })

    const response = await proxy(createRequest('/admin/releases'))

    expect(response.headers.get('location')).toBe('https://example.com/admin/login?redirect=%2Fadmin%2Freleases')
    // We expect cookies to not be manually persisted on the redirect, just letting it flow.
  })

  it('preserves the OAuth authorization ID across admin login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('not signed in') })
    const response = await proxy(createRequest('/admin/oauth/consent', {
      url: 'https://example.com/admin/oauth/consent?authorization_id=00000000-0000-4000-8000-000000000001',
    }))
    const destination = new URL(response.headers.get('location')!)
    expect(destination.pathname).toBe('/admin/login')
    expect(destination.searchParams.get('redirect')).toBe(
      '/admin/oauth/consent?authorization_id=00000000-0000-4000-8000-000000000001',
    )
  })

  it('returns next response for admin user and preserves refreshed cookies', async () => {
    mockCookiesToSet.push({
      name: 'sb-refresh-token',
      value: 'fresh-refresh-token',
      options: { path: '/', httpOnly: true },
    })
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-user' } },
      error: null,
    })
    mockSingle.mockResolvedValue({
      data: { role: 'admin' },
    })

    const response = await proxy(createRequest('/admin/releases'))

    expect(response.headers.get('location')).toBeNull()
    expect(response.cookies.get('sb-refresh-token')?.value).toBe('fresh-refresh-token')
  })

  it('forbids a signed-in user when the profile lookup returns an error', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-user' } },
      error: null,
    })
    mockSingle.mockResolvedValue({
      data: { role: 'admin' },
      error: { message: 'permission denied' },
    })

    const response = await proxy(createRequest('/admin/releases'))

    expect(response.headers.get('location')).toBe('https://example.com/admin/login?error=forbidden')
  })

  it('forbids a signed-in user when the profile row is missing', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-user' } },
      error: null,
    })
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: '0 rows' },
    })

    const response = await proxy(createRequest('/admin/releases'))

    expect(response.headers.get('location')).toBe('https://example.com/admin/login?error=forbidden')
  })

  it('redirects to forbidden when authenticated user is not admin', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'regular-user' } },
      error: null,
    })
    mockSingle.mockResolvedValue({
      data: { role: 'user' },
    })

    const response = await proxy(createRequest('/admin/releases'))

    expect(response.headers.get('location')).toBe('https://example.com/admin/login?error=forbidden')
  })

  it('forbids the request when profile lookup throws', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-user' } },
      error: null,
    })
    mockSingle.mockRejectedValue(new Error('temporary lookup failure'))

    const response = await proxy(createRequest('/admin/releases'))

    expect(response.headers.get('location')).toBe('https://example.com/admin/login?error=forbidden')
  })

  it('applies cache-control headers from @supabase/ssr to the response', async () => {
    mockCookiesToSet.push({
      name: 'sb-access-token',
      value: 'refreshed-token',
      options: { path: '/', httpOnly: false },
    })
    mockAuthHeaders['Cache-Control'] = 'private, no-cache, no-store, must-revalidate, max-age=0'
    mockAuthHeaders['Expires'] = '0'
    mockAuthHeaders['Pragma'] = 'no-cache'
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-user' } },
      error: null,
    })
    mockSingle.mockResolvedValue({ data: { role: 'admin' } })

    const response = await proxy(createRequest('/admin/releases'))

    expect(response.headers.get('location')).toBeNull()
    expect(response.headers.get('cache-control')).toBe(
      'private, no-cache, no-store, must-revalidate, max-age=0',
    )
    expect(response.headers.get('expires')).toBe('0')
    expect(response.headers.get('pragma')).toBe('no-cache')
  })
})

describe('centralized MFA navigation for protected admin pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCookiesToSet.length = 0
    for (const key of Object.keys(mockAuthHeaders)) delete mockAuthHeaders[key]
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-user' } }, error: null })
    mockSingle.mockResolvedValue({ data: { role: 'admin' }, error: null })
    mockGetAssurance.mockResolvedValue({
      data: { currentLevel: 'aal1', nextLevel: 'aal2' }, error: null,
    })
  })

  it.each([
    '/admin/contact-inbox',
    '/admin/contact-spam',
    '/admin/orders',
    '/admin/privacy',
    '/admin/withdrawals',
    '/admin/plugins/beta-diagnostics',
    '/admin/soundpacks/00000000-0000-4000-8000-000000000001',
  ])('redirects unverified admins for %s to the central MFA challenge', async (path) => {
    const response = await proxy(createRequest(path))
    expect(response.status).toBe(303)
    const target = new URL(response.headers.get('location')!)
    expect(target.pathname).toBe('/admin/mfa')
    expect(target.searchParams.get('returnTo')).toBe(path)
    expect(mockGetAssurance).toHaveBeenCalledOnce()
  })

  it('preserves the full search string, response cookies, and cache-control on MFA redirect', async () => {
    mockCookiesToSet.push({
      name: 'sb-refresh-token', value: 'fresh-token', options: { path: '/', httpOnly: true },
    })
    mockAuthHeaders['Cache-Control'] = 'private, no-cache, no-store'
    const url = 'https://example.com/admin/contact-inbox?q=alice%40example.com&show=all'
    const response = await proxy(createRequest('/admin/contact-inbox', { url }))
    const target = new URL(response.headers.get('location')!)
    expect(target.searchParams.get('returnTo'))
      .toBe('/admin/contact-inbox?q=alice%40example.com&show=all')
    expect(response.cookies.get('sb-refresh-token')?.value).toBe('fresh-token')
    expect(response.headers.get('cache-control')).toBe('private, no-cache, no-store')
  })

  it('allows already verified AAL2 administrators through', async () => {
    mockGetAssurance.mockResolvedValue({
      data: { currentLevel: 'aal2', nextLevel: 'aal2' }, error: null,
    })
    const response = await proxy(createRequest('/admin/privacy'))
    expect(response.headers.get('location')).toBeNull()
  })

  it('fails closed and redirects if MFA assurance cannot be read', async () => {
    mockGetAssurance.mockResolvedValue({ data: null, error: new Error('auth unavailable') })
    const response = await proxy(createRequest('/admin/privacy'))
    expect(new URL(response.headers.get('location')!).pathname).toBe('/admin/mfa')
  })

  it('also fails closed when assurance lookup throws', async () => {
    mockGetAssurance.mockRejectedValue(new Error('connection failed'))
    const response = await proxy(createRequest('/admin/contact-inbox'))
    expect(new URL(response.headers.get('location')!).pathname).toBe('/admin/mfa')
  })

  it.each([
    '/admin/mfa',
    '/admin/security',
    '/admin/releases',
    '/admin/soundpacks/new',
    '/admin/privacy/export',
    '/admin/privacy/complete',
  ])('does not redirect unrelated pages or submission routes: %s', async (path) => {
    const response = await proxy(createRequest(path))
    expect(response.headers.get('location')).toBeNull()
    expect(mockGetAssurance).not.toHaveBeenCalled()
  })

  it('does not MFA-redirect non-GET requests, leaving API guards responsible', async () => {
    const response = await proxy(createRequest('/admin/privacy', { method: 'POST' }))
    expect(response.headers.get('location')).toBeNull()
    expect(mockGetAssurance).not.toHaveBeenCalled()
  })

  it('checks the role before querying MFA assurance', async () => {
    mockSingle.mockResolvedValue({ data: { role: 'user' }, error: null })
    const response = await proxy(createRequest('/admin/privacy'))
    expect(new URL(response.headers.get('location')!).pathname).toBe('/admin/login')
    expect(mockGetAssurance).not.toHaveBeenCalled()
  })
})

describe('HTTPS redirect', () => {
  it('308-redirects when x-forwarded-proto is http', async () => {
    const response = await proxy(
      createRequest('/', {
        headers: { 'x-forwarded-proto': 'http' },
        url: 'http://neuroklast.net/',
      }),
    )
    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe('https://neuroklast.net/')
  })

  it('does not bounce localhost HTTP', async () => {
    const response = await proxy(
      createRequest('/', {
        headers: { 'x-forwarded-proto': 'http' },
        url: 'http://localhost:3000/',
      }),
    )
    expect(response.status).not.toBe(308)
    expect(response.headers.get('location')).toBeNull()
  })
})
