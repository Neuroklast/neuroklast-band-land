import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockCreateActionClient, mockSignOut, mockRedirect } = vi.hoisted(() => ({
  mockCreateActionClient: vi.fn(),
  mockSignOut: vi.fn(),
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

import { GET, POST } from '@/app/admin/logout/route'

describe('admin logout session isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSignOut.mockResolvedValue({ error: null })
    mockCreateActionClient.mockResolvedValue({
      auth: { signOut: mockSignOut },
    })
  })

  it('does not sign out on GET, including link prefetches', async () => {
    await expect(GET(new Request('https://neuroklast.net/admin/logout'))).rejects.toThrow(
      'NEXT_REDIRECT:/admin/login',
    )

    expect(mockCreateActionClient).not.toHaveBeenCalled()
    expect(mockSignOut).not.toHaveBeenCalled()
    expect(mockRedirect).toHaveBeenCalledWith('/admin/login')
  })

  it('signs out only the current browser session on POST', async () => {
    await expect(POST(new Request('https://neuroklast.net/admin/logout', {
      method: 'POST',
    }))).rejects.toThrow('NEXT_REDIRECT:/admin/login')

    expect(mockCreateActionClient).toHaveBeenCalledOnce()
    expect(mockSignOut).toHaveBeenCalledExactlyOnceWith({ scope: 'local' })
    expect(mockRedirect).toHaveBeenCalledWith('/admin/login')
  })
})
