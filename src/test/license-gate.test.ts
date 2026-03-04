/**
 * Tests for the license gate in the Store:
 * - Premium items should be blocked (disabled) for Free tier
 * - Premium items should be allowed for Pro+
 * - Free items should always be allowed
 */
import { describe, it, expect } from 'vitest'
import { hasFeature, tierAtLeast } from '@/lib/license'
import type { LicenseTier } from '@/lib/license'
import { WIDGET_CATALOG } from '@/lib/widget-plugins'

// ─── Helper: simulates the gate logic in StoreDialog ─────────────────────────

function isPremiumLocked(itemLicense: 'free' | 'premium', tier: LicenseTier): boolean {
  return itemLicense === 'premium' && !hasFeature(tier, 'premium-themes')
}

// ─── Free items — never locked ────────────────────────────────────────────────

describe('License gate — free items', () => {
  const tiers: LicenseTier[] = ['free', 'pro', 'agency', 'saas']

  for (const tier of tiers) {
    it(`free item is NOT locked for ${tier} tier`, () => {
      expect(isPremiumLocked('free', tier)).toBe(false)
    })
  }
})

// ─── Premium items — locked for free, unlocked for pro+ ─────────────────────

describe('License gate — premium items', () => {
  it('premium item IS locked for free tier', () => {
    expect(isPremiumLocked('premium', 'free')).toBe(true)
  })

  it('premium item is NOT locked for pro tier', () => {
    expect(isPremiumLocked('premium', 'pro')).toBe(false)
  })

  it('premium item is NOT locked for agency tier', () => {
    expect(isPremiumLocked('premium', 'agency')).toBe(false)
  })

  it('premium item is NOT locked for saas tier', () => {
    expect(isPremiumLocked('premium', 'saas')).toBe(false)
  })
})

// ─── Widget catalog gate logic ────────────────────────────────────────────────

describe('Widget catalog premium gate', () => {
  const premiumWidgets = WIDGET_CATALOG.filter((w) => w.license === 'premium')
  const freeWidgets = WIDGET_CATALOG.filter((w) => w.license === 'free')

  it('catalog has premium widgets (sanity check)', () => {
    expect(premiumWidgets.length).toBeGreaterThan(0)
  })

  it('catalog has free widgets (sanity check)', () => {
    expect(freeWidgets.length).toBeGreaterThan(0)
  })

  it('all premium widgets are locked for free tier', () => {
    for (const widget of premiumWidgets) {
      expect(isPremiumLocked(widget.license!, 'free')).toBe(true)
    }
  })

  it('all premium widgets are unlocked for pro tier', () => {
    for (const widget of premiumWidgets) {
      expect(isPremiumLocked(widget.license!, 'pro')).toBe(false)
    }
  })

  it('all free widgets are unlocked for free tier', () => {
    for (const widget of freeWidgets) {
      expect(isPremiumLocked(widget.license!, 'free')).toBe(false)
    }
  })

  it('merch-store is premium and locked for free tier', () => {
    const merch = WIDGET_CATALOG.find((w) => w.id === 'merch-store')
    expect(merch?.license).toBe('premium')
    expect(isPremiumLocked('premium', 'free')).toBe(true)
  })

  it('analytics-dashboard is premium and locked for free tier', () => {
    const analytics = WIDGET_CATALOG.find((w) => w.id === 'analytics-dashboard')
    expect(analytics?.license).toBe('premium')
    expect(isPremiumLocked('premium', 'free')).toBe(true)
  })

  it('bandsintown is free and not locked for any tier', () => {
    const bt = WIDGET_CATALOG.find((w) => w.id === 'bandsintown')
    expect(bt?.license).toBe('free')
    for (const tier of ['free', 'pro', 'agency', 'saas'] as LicenseTier[]) {
      expect(isPremiumLocked('free', tier)).toBe(false)
    }
  })
})

// ─── Tier ordering ────────────────────────────────────────────────────────────

describe('Tier ordering for premium gate', () => {
  it('pro meets or exceeds pro', () => {
    expect(tierAtLeast('pro', 'pro')).toBe(true)
  })

  it('agency meets or exceeds pro', () => {
    expect(tierAtLeast('agency', 'pro')).toBe(true)
  })

  it('saas meets or exceeds pro', () => {
    expect(tierAtLeast('saas', 'pro')).toBe(true)
  })

  it('free does not meet pro', () => {
    expect(tierAtLeast('free', 'pro')).toBe(false)
  })

  it('hasFeature pro includes premium-themes', () => {
    expect(hasFeature('pro', 'premium-themes')).toBe(true)
  })

  it('hasFeature free excludes premium-themes', () => {
    expect(hasFeature('free', 'premium-themes')).toBe(false)
  })
})
