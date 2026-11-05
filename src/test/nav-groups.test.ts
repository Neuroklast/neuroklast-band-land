import { describe, expect, it } from 'vitest'
import { ADMIN_NAV_GROUPS, ADMIN_NAV_ITEMS, isNavItemActive, resolveActiveNavItem, resolveActiveNavGroupId } from '@/app/admin/_config/nav-groups'

describe('nav-groups active matching', () => {
  it('prefers longest href match', () => {
    const active = resolveActiveNavItem('/admin/releases/sync')
    expect(active?.href).toBe('/admin/releases/sync')
    expect(active?.label).toBe('Catalogue Sync')
  })

  it('matches dashboard exactly only', () => {
    expect(resolveActiveNavItem('/admin')?.href).toBe('/admin')
    expect(resolveActiveNavItem('/admin/releases')?.href).toBe('/admin/releases')
  })

  it('preserves all 30 destinations exactly once after regrouping', () => {
    const hrefs = ADMIN_NAV_ITEMS.map((item) => item.href)
    expect(hrefs).toHaveLength(30)
    expect(new Set(hrefs).size).toBe(hrefs.length)
    expect(hrefs).toContain('/admin/contact-inbox')
    expect(hrefs).toContain('/admin/contact-spam')
    expect(hrefs).toContain('/admin/withdrawals')
    expect(hrefs).toContain('/admin/releases/sync')
  })

  it('opens the correct section for nested pages without stealing the catalogue sync route', () => {
    expect(resolveActiveNavGroupId('/admin/contact-spam')).toBe('support')
    expect(resolveActiveNavGroupId('/admin/orders')).toBe('shop')
    expect(resolveActiveNavGroupId('/admin/releases/track-123')).toBe('content')
    expect(resolveActiveNavGroupId('/admin/releases/sync')).toBe('system')
    expect(resolveActiveNavGroupId('/admin')).toBe('overview')
    expect(resolveActiveNavGroupId('/admin/unknown')).toBe(null)
  })

  it('keeps navigation sections short and task oriented', () => {
    const sections = ADMIN_NAV_GROUPS.filter((group) => group.id !== 'overview')
    expect(sections.map((group) => group.id)).toEqual([
      'site', 'artist', 'content', 'shop', 'support', 'ai', 'system',
    ])
    expect(sections.every((group) => group.items.length <= 6)).toBe(true)
  })

  it('isNavItemActive returns single active item', () => {
    const gallery = { href: '/admin/gallery', label: 'Gallery' }
    const dashboard = { href: '/admin', label: 'Dashboard', exact: true }
    expect(isNavItemActive('/admin/gallery/abc', gallery)).toBe(true)
    expect(isNavItemActive('/admin/gallery/abc', dashboard)).toBe(false)
  })
})