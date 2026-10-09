import type { ReactElement } from 'react'
import { describe, expect, it, beforeEach, vi } from 'vitest'

const { mockCreateActionClient, mockRedirect } = vi.hoisted(() => ({
  mockCreateActionClient: vi.fn(),
  mockRedirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`)
  }),
}))

vi.mock('@/lib/supabaseServer', () => ({
  createActionClient: mockCreateActionClient,
}))

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}))

vi.mock('@/app/admin/_components/AdminNav', () => ({
  AdminNav: () => null,
}))

vi.mock('@/app/admin/_components/AdminHelpPalette', () => ({
  AdminHelpPalette: () => null,
}))

import ProtectedAdminLayout from '@/app/admin/(protected)/layout'

describe('ProtectedAdminLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mockClient(
    user: { id: string } | null,
    profile?: { data: unknown; error?: unknown } | 'throw',
  ) {
    mockCreateActionClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user } }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single:
              profile === 'throw'
                ? vi.fn().mockRejectedValue(new Error('temporary lookup failure'))
                : vi.fn().mockResolvedValue(profile ?? { data: { role: 'admin' } }),
          }),
        }),
      }),
    })
  }

  it('renders when the signed-in user is an admin', async () => {
    mockClient({ id: 'admin-user' }, { data: { role: 'admin' } })

    const result = await ProtectedAdminLayout({
      children: <div>secure content</div>,
    })

    expect(result).toBeTruthy()
    expect((result as ReactElement).props.children).toBeTruthy()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('redirects when a signed-in user has no admin profile', async () => {
    mockClient({ id: 'user' }, { data: null, error: { message: '0 rows' } })

    await expect(
      ProtectedAdminLayout({
        children: <div>secure content</div>,
      }),
    ).rejects.toThrow('NEXT_REDIRECT:/admin/login?error=forbidden')
  })

  it('redirects when the signed-in user is not an admin', async () => {
    mockClient({ id: 'user' }, { data: { role: 'fan' } })

    await expect(
      ProtectedAdminLayout({
        children: <div>secure content</div>,
      }),
    ).rejects.toThrow('NEXT_REDIRECT:/admin/login?error=forbidden')
  })

  it('redirects when the profile lookup returns an error', async () => {
    mockClient({ id: 'admin-user' }, { data: { role: 'admin' }, error: { message: 'permission denied' } })

    await expect(
      ProtectedAdminLayout({
        children: <div>secure content</div>,
      }),
    ).rejects.toThrow('NEXT_REDIRECT:/admin/login?error=forbidden')
  })

  it('does not render when the profile lookup throws', async () => {
    mockClient({ id: 'admin-user' }, 'throw')

    await expect(
      ProtectedAdminLayout({
        children: <div>secure content</div>,
      }),
    ).rejects.toThrow('NEXT_REDIRECT:/admin/login?error=config')
  })

  it('redirects to login when fallback user lookup fails', async () => {
    mockClient(null)

    await expect(
      ProtectedAdminLayout({
        children: <div>secure content</div>,
      }),
    ).rejects.toThrow('NEXT_REDIRECT:/admin/login')
    expect(mockRedirect).toHaveBeenCalledWith('/admin/login')
  })

  it('redirects with config error when supabase client creation fails', async () => {
    mockCreateActionClient.mockRejectedValue(new Error('missing env'))

    await expect(
      ProtectedAdminLayout({
        children: <div>secure content</div>,
      }),
    ).rejects.toThrow('NEXT_REDIRECT:/admin/login?error=config')
    expect(mockRedirect).toHaveBeenCalledWith('/admin/login?error=config')
  })
})
