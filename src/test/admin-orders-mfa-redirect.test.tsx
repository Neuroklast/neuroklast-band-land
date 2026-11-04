import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockAdmin, mockDb, mockRedirect } = vi.hoisted(() => ({
  mockAdmin: vi.fn(),
  mockDb: vi.fn(),
  mockRedirect: vi.fn(),
}))

vi.mock('@/lib/neurokore/server', () => ({
  admin: mockAdmin,
  db: mockDb,
}))
vi.mock('next/navigation', () => ({
  redirect: (path: string) => {
    mockRedirect(path)
    throw new Error('NEXT_REDIRECT')
  },
}))
vi.mock('@/app/admin/_components/AdminPageHeader', () => ({
  AdminPageHeader: () => null,
}))
vi.mock('@/app/admin/(protected)/orders/ReconcileOrderButton', () => ({
  ReconcileOrderButton: () => null,
}))
vi.mock('@/app/admin/(protected)/orders/OrderLicenceKey', () => ({
  OrderLicenceKey: () => null,
}))

import PluginOrdersPage from '@/app/admin/(protected)/orders/page'

describe('Plugin orders admin MFA gate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAdmin.mockResolvedValue('admin-user')
    mockDb.mockReturnValue({
      from: () => ({
        select: () => ({
          order: () => ({
            limit: async () => ({ data: [], error: null }),
          }),
        }),
      }),
    })
  })

  it('redirects expired AAL1 sessions to the existing MFA challenge', async () => {
    mockAdmin.mockRejectedValueOnce(new Error('MFA required'))

    await expect(PluginOrdersPage({ searchParams: Promise.resolve({}) }))
      .rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledExactlyOnceWith('/admin/mfa?returnTo=%2Fadmin%2Forders')
    expect(mockDb).not.toHaveBeenCalled()
  })

  it('never redirects or queries orders after an unrelated authentication failure', async () => {
    mockAdmin.mockRejectedValueOnce(new Error('Administrator required'))

    await expect(PluginOrdersPage({ searchParams: Promise.resolve({}) }))
      .rejects.toThrow('Administrator required')
    expect(mockRedirect).not.toHaveBeenCalled()
    expect(mockDb).not.toHaveBeenCalled()
  })

  it('loads the orders page when the admin authentication is valid', async () => {
    const page = await PluginOrdersPage({ searchParams: Promise.resolve({}) })
    expect(page.type).toBe('main')
    expect(mockAdmin).toHaveBeenCalledOnce()
    expect(mockDb).toHaveBeenCalledOnce()
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})
