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
  redirect: mockRedirect,
}))

vi.mock('@/app/admin/_components/AdminPageHeader', () => ({
  AdminPageHeader: () => null,
}))
vi.mock('@/app/admin/(protected)/contact-inbox/ContactCaseActions', () => ({
  ContactCaseActions: () => null,
}))
vi.mock('@/app/admin/(protected)/contact-spam/ContactSpamEditor', () => ({
  ContactSpamEditor: () => null,
}))

import ContactInboxPage from '@/app/admin/(protected)/contact-inbox/page'
import ContactSpamPage from '@/app/admin/(protected)/contact-spam/page'

describe('contact administration MFA redirects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRedirect.mockImplementation((url: string) => {
      throw new Error('NEXT_REDIRECT:' + url)
    })
  })

  it('sends an unverified inbox administrator to MFA before querying private messages', async () => {
    mockAdmin.mockRejectedValue(new Error('MFA required'))

    await expect(ContactInboxPage({ searchParams: Promise.resolve({}) }))
      .rejects.toThrow('NEXT_REDIRECT:/admin/mfa?returnTo=%2Fadmin%2Fcontact-inbox')
    expect(mockDb).not.toHaveBeenCalled()
  })

  it('preserves inbox search and status filters while requesting MFA', async () => {
    mockAdmin.mockRejectedValue(new Error('MFA required'))

    await expect(ContactInboxPage({
      searchParams: Promise.resolve({ q: 'customer@example.com', show: 'all' }),
    })).rejects.toThrow('NEXT_REDIRECT:')
    expect(mockRedirect).toHaveBeenCalledWith(
      '/admin/mfa?returnTo=' + encodeURIComponent('/admin/contact-inbox?q=customer%40example.com&show=all'),
    )
    expect(mockDb).not.toHaveBeenCalled()
  })

  it('sends an unverified spam-filter administrator to MFA before loading private rules', async () => {
    mockAdmin.mockRejectedValue(new Error('MFA required'))

    await expect(ContactSpamPage())
      .rejects.toThrow('NEXT_REDIRECT:/admin/mfa?returnTo=%2Fadmin%2Fcontact-spam')
    expect(mockDb).not.toHaveBeenCalled()
  })

  it('does not treat missing administrator permissions as an MFA challenge', async () => {
    mockAdmin.mockRejectedValue(new Error('Administrator required'))

    await expect(ContactInboxPage({ searchParams: Promise.resolve({}) }))
      .rejects.toThrow('Administrator required')
    await expect(ContactSpamPage()).rejects.toThrow('Administrator required')
    expect(mockRedirect).not.toHaveBeenCalled()
    expect(mockDb).not.toHaveBeenCalled()
  })

  it('still loads the inbox when the administrator already passed MFA', async () => {
    mockAdmin.mockResolvedValue('admin-user-id')
    const query = {
      select: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    }
    const from = vi.fn().mockReturnValue(query)
    mockDb.mockReturnValue({ from })

    const result = await ContactInboxPage({ searchParams: Promise.resolve({}) })
    expect(result.type).toBe('main')
    expect(from).toHaveBeenCalledWith('plugin_contact_requests')
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})
