/**
 * Tests for the license gate in the Store:
 * - Premium items should be blocked (disabled) for Free tier
 * - Premium items should be allowed for Premium+
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
  const tiers: LicenseTier[] = ['free', 'premium', 'agency']

  for (const tier of tiers) {
    it(`free item is NOT locked for ${tier} tier`, () => {
      expect(isPremiumLocked('free', tier)).toBe(false)
    })
  }
})

// ─── Premium items — locked for free, unlocked for premium+ ─────────────────

describe('License gate — premium items', () => {
  it('premium item IS locked for free tier', () => {
    expect(isPremiumLocked('premium', 'free')).toBe(true)
  })

  it('premium item is NOT locked for premium tier', () => {
    expect(isPremiumLocked('premium', 'premium')).toBe(false)
  })

  it('premium item is NOT locked for agency tier', () => {
    expect(isPremiumLocked('premium', 'agency')).toBe(false)
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

  it('all premium widgets are unlocked for premium tier', () => {
    for (const widget of premiumWidgets) {
      expect(isPremiumLocked(widget.license!, 'premium')).toBe(false)
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
    for (const tier of ['free', 'premium', 'agency'] as LicenseTier[]) {
      expect(isPremiumLocked('free', tier)).toBe(false)
    }
  })
})

// ─── Tier ordering ────────────────────────────────────────────────────────────

describe('Tier ordering for premium gate', () => {
  it('premium meets or exceeds premium', () => {
    expect(tierAtLeast('premium', 'premium')).toBe(true)
  })

  it('agency meets or exceeds premium', () => {
    expect(tierAtLeast('agency', 'premium')).toBe(true)
  })

  it('free does not meet premium', () => {
    expect(tierAtLeast('free', 'premium')).toBe(false)
  })

  it('hasFeature premium includes premium-themes', () => {
    expect(hasFeature('premium', 'premium-themes')).toBe(true)
  })

  it('hasFeature free excludes premium-themes', () => {
    expect(hasFeature('free', 'premium-themes')).toBe(false)
  })
})
