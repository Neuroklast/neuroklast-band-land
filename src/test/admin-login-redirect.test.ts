import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockSignIn, mockConsume } = vi.hoisted(() => ({
  mockSignIn: vi.fn(),
  mockConsume: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    getAll: () => [],
  })),
}))

vi.mock('@/lib/rate-limit', () => ({
  consumeRateLimitForRequest: (...args: unknown[]) => mockConsume(...args),
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignIn(...args),
    },
  })),
}))

import { POST, safeAdminRedirect } from '@/app/admin/login/submit/route'

const base = 'https://neuroklast.net/admin/login/submit'

function loginRequest(fields: Record<string, string>): Request {
  const body = new URLSearchParams()
  for (const [key, value] of Object.entries(fields)) body.set(key, value)
  return new Request(base, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  })
}

function locationOf(response: Response): URL {
  const location = response.headers.get('location')
  expect(location).toBeTruthy()
  return new URL(location as string)
}

describe('safeAdminRedirect', () => {
  it('keeps a same-host admin path', () => {
    expect(safeAdminRedirect('/admin/releases', base)).toBe('/admin/releases')
  })

  it('rejects protocol-relative and backslash hosts', () => {
    expect(safeAdminRedirect('//evil.com', base)).toBe('/admin')
    expect(safeAdminRedirect('/\\evil.com', base)).toBe('/admin')
    expect(safeAdminRedirect('https://evil.com', base)).toBe('/admin')
    expect(safeAdminRedirect('/.//evil.com', base)).toBe('/admin')
    expect(safeAdminRedirect('/foo/..//evil.com', base)).toBe('/admin')
    expect(safeAdminRedirect('/%2e//evil.com', base)).toBe('/admin')
  })
})

describe('POST admin login redirect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    mockConsume.mockResolvedValue({ allowed: true, namespace: 'login' })
    mockSignIn.mockResolvedValue({ error: null })
  })

  it('sends a successful login to the sanitized same-host path', async () => {
    const response = await POST(
      loginRequest({
        email: 'ada@example.com',
        password: 'secret',
        redirectTo: '/admin/releases',
      }),
    )

    const url = locationOf(response)
    expect(response.status).toBe(303)
    expect(url.origin).toBe('https://neuroklast.net')
    expect(url.pathname).toBe('/admin/releases')
  })

  it('does not send a successful login to a collapsed protocol-relative path', async () => {
    const response = await POST(
      loginRequest({
        email: 'ada@example.com',
        password: 'secret',
        redirectTo: '/.//evil.com',
      }),
    )

    const url = locationOf(response)
    expect(url.origin).toBe('https://neuroklast.net')
    expect(url.pathname).toBe('/admin')
    expect(url.href).not.toContain('evil.com')
  })

  it('does not send a successful login to an off-host URL', async () => {
    const response = await POST(
      loginRequest({
        email: 'ada@example.com',
        password: 'secret',
        redirectTo: '//evil.com',
      }),
    )

    const url = locationOf(response)
    expect(url.origin).toBe('https://neuroklast.net')
    expect(url.pathname).toBe('/admin')
    expect(url.href).not.toContain('evil.com')
  })

  it('keeps the sanitized path on the error redirect query', async () => {
    const response = await POST(
      loginRequest({
        email: 'ada@example.com',
        redirectTo: '/admin/releases',
      }),
    )

    const url = locationOf(response)
    expect(url.origin).toBe('https://neuroklast.net')
    expect(url.pathname).toBe('/admin/login')
    expect(url.searchParams.get('redirect')).toBe('/admin/releases')
    expect(url.searchParams.get('msg')).toBe('Password is required.')
  })

  it('does not echo an off-host URL on error redirect queries', async () => {
    mockConsume.mockResolvedValue({ allowed: false, namespace: 'login', retryAfter: 60 })

    const response = await POST(
      loginRequest({
        email: 'ada@example.com',
        password: 'secret',
        redirectTo: 'https://evil.com/phish',
      }),
    )

    const url = locationOf(response)
    expect(url.origin).toBe('https://neuroklast.net')
    expect(url.pathname).toBe('/admin/login')
    expect(url.searchParams.get('redirect')).toBeNull()
    expect(url.href).not.toContain('evil.com')
  })

  it('does not echo a backslash host on the error redirect query', async () => {
    const response = await POST(
      loginRequest({
        email: 'ada@example.com',
        redirectTo: '/\\evil.com',
      }),
    )

    const url = locationOf(response)
    expect(url.origin).toBe('https://neuroklast.net')
    expect(url.searchParams.get('redirect')).toBeNull()
    expect(url.href).not.toContain('evil.com')
  })
})
