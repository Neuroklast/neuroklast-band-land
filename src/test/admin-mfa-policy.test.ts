import { describe, expect, it } from 'vitest'
import { requiresAdminMfaChallenge, requiresAdminMfaPage } from '@/lib/admin-mfa-policy'

describe('shared admin MFA policy', () => {
  it('requires MFA for the strict admin page routes', () => {
    for (const route of [
      '/admin/contact-inbox',
      '/admin/contact-spam',
      '/admin/orders',
      '/admin/privacy',
      '/admin/withdrawals',
      '/admin/plugins/beta-diagnostics',
      '/admin/soundpacks/00000000-0000-4000-8000-000000000001',
    ]) {
      expect(requiresAdminMfaPage(route, 'GET'), route).toBe(true)
      expect(requiresAdminMfaPage(route + '/', 'HEAD'), route).toBe(true)
    }
  })

  it('excludes enrollment, unaffected pages, nested action paths, and non-navigation methods', () => {
    for (const route of [
      '/admin/mfa',
      '/admin/security',
      '/admin/integrations',
      '/admin/soundpacks',
      '/admin/soundpacks/new',
      '/admin/privacy/export',
      '/admin/privacy/complete',
      '/admin/contact-inbox/status',
      '/api/admin/contact-inbox/status',
    ]) {
      expect(requiresAdminMfaPage(route, 'GET'), route).toBe(false)
    }
    expect(requiresAdminMfaPage('/admin/contact-inbox', 'POST')).toBe(false)
  })

  it('shares the strict MFA assurance logic with the server guard', () => {
    expect(requiresAdminMfaChallenge({ currentLevel: 'aal1', nextLevel: 'aal2' }, null)).toBe(true)
    expect(requiresAdminMfaChallenge({ currentLevel: 'aal2', nextLevel: 'aal2' }, null)).toBe(false)
    expect(requiresAdminMfaChallenge({ currentLevel: 'aal1', nextLevel: 'aal1' }, null)).toBe(false)
    expect(requiresAdminMfaChallenge(null, null)).toBe(true)
    expect(requiresAdminMfaChallenge({ currentLevel: 'aal2', nextLevel: 'aal2' }, new Error('auth unavailable'))).toBe(true)
  })
})
