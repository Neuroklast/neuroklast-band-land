import { describe, it, expect, beforeEach } from 'vitest'
import {
  registerAdminAction,
  executeAdminAction,
  getRegisteredActionIds,
  getAdminAction,
  _clearAdminActionRegistryForTesting,
} from '@/lib/admin-action-registry'
import type { SiteConfig } from '@/lib/types'
import { DEFAULT_SITE_CONFIG } from '@/lib/site-config'

const MOCK_CONFIG: SiteConfig = { ...DEFAULT_SITE_CONFIG, siteId: 'test-id', siteName: 'Test Band' }

describe('AdminActionRegistry', () => {
  // The registry is module-level singleton — built-in actions (update-site-name,
  // toggle-feature) are already registered on import. We only clear before tests
  // that register their own actions to avoid duplicate-ID errors.
  describe('built-in actions', () => {
    it('update-site-name is registered', () => {
      expect(getAdminAction('update-site-name')).toBeDefined()
    })

    it('toggle-feature is registered', () => {
      expect(getAdminAction('toggle-feature')).toBeDefined()
    })

    it('getRegisteredActionIds returns all registered IDs', () => {
      const ids = getRegisteredActionIds()
      expect(ids).toContain('update-site-name')
      expect(ids).toContain('toggle-feature')
    })
  })

  describe('executeAdminAction', () => {
    it('update-site-name returns updated config slice', () => {
      const result = executeAdminAction('update-site-name', { siteName: 'New Name' }, MOCK_CONFIG)
      expect(result).toEqual({ siteName: 'New Name' })
    })

    it('update-site-name throws on empty string', () => {
      expect(() =>
        executeAdminAction('update-site-name', { siteName: '' }, MOCK_CONFIG)
      ).toThrow()
    })

    it('update-site-name throws on non-object input', () => {
      expect(() =>
        executeAdminAction('update-site-name', 'not-an-object', MOCK_CONFIG)
      ).toThrow()
    })

    it('toggle-feature returns updated features slice', () => {
      const result = executeAdminAction(
        'toggle-feature',
        { feature: 'newsletter', enabled: true },
        MOCK_CONFIG,
      ) as Partial<SiteConfig>
      expect(result.features?.newsletter).toBe(true)
    })

    it('toggle-feature preserves other feature flags', () => {
      const result = executeAdminAction(
        'toggle-feature',
        { feature: 'gallery', enabled: false },
        MOCK_CONFIG,
      ) as Partial<SiteConfig>
      expect(result.features?.gallery).toBe(false)
      expect(result.features?.contactForm).toBe(MOCK_CONFIG.features?.contactForm)
    })

    it('throws for unknown action ID', () => {
      expect(() =>
        executeAdminAction('non-existent-action', {}, MOCK_CONFIG)
      ).toThrow(/unknown action/)
    })
  })

  describe('registerAdminAction', () => {
    beforeEach(() => {
      _clearAdminActionRegistryForTesting()
    })

    it('registers a custom action and makes it executable', () => {
      registerAdminAction({
        id: 'test-action',
        description: 'A test action',
        validate: (input) => input as { value: string },
        execute: (input) => input.value.toUpperCase(),
      })
      const result = executeAdminAction('test-action', { value: 'hello' }, MOCK_CONFIG)
      expect(result).toBe('HELLO')
    })

    it('throws on duplicate action ID', () => {
      registerAdminAction({
        id: 'dupe-action',
        description: 'First',
        validate: (i) => i,
        execute: () => undefined,
      })
      expect(() =>
        registerAdminAction({
          id: 'dupe-action',
          description: 'Second',
          validate: (i) => i,
          execute: () => undefined,
        })
      ).toThrow(/duplicate action ID/)
    })
  })
})
