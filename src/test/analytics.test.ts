import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadAnalytics,
  trackPageView,
  trackSectionView,
  trackInteraction,
  resetAnalytics,
} from '@/lib/analytics'

describe('analytics', () => {
  beforeEach(() => {
    resetAnalytics()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('returns empty analytics when no data exists', () => {
    const analytics = loadAnalytics()
    expect(analytics.totalPageViews).toBe(0)
    expect(analytics.totalSessions).toBe(0)
    expect(analytics.sectionViews).toEqual({})
    expect(analytics.interactions).toEqual({})
    expect(analytics.dailyStats).toEqual([])
  })

  it('tracks page views', () => {
    trackPageView()
    const analytics = loadAnalytics()
    expect(analytics.totalPageViews).toBe(1)
    expect(analytics.totalSessions).toBe(1)
    expect(analytics.dailyStats.length).toBe(1)
    expect(analytics.dailyStats[0].pageViews).toBe(1)
    expect(analytics.firstTracked).toBeDefined()
    expect(analytics.lastTracked).toBeDefined()
  })

  it('increments page views on multiple calls', () => {
    trackPageView()
    trackPageView()
    trackPageView()
    const analytics = loadAnalytics()
    expect(analytics.totalPageViews).toBe(3)
    // Sessions should be 1 since they deduplicate per day via sessionStorage
    expect(analytics.totalSessions).toBe(1)
  })

  it('tracks section views', () => {
    trackSectionView('biography')
    trackSectionView('releases')
    trackSectionView('biography')
    const analytics = loadAnalytics()
    expect(analytics.sectionViews['biography']).toBe(2)
    expect(analytics.sectionViews['releases']).toBe(1)
  })

  it('tracks interactions', () => {
    trackInteraction('member_profile')
    trackInteraction('release_click')
    trackInteraction('member_profile')
    const analytics = loadAnalytics()
    expect(analytics.interactions['member_profile']).toBe(2)
    expect(analytics.interactions['release_click']).toBe(1)
  })

  it('tracks daily stats for section views and interactions', () => {
    trackSectionView('gigs')
    trackInteraction('ticket_click')
    const analytics = loadAnalytics()
    const today = analytics.dailyStats[analytics.dailyStats.length - 1]
    expect(today.sectionViews).toBeGreaterThanOrEqual(1)
    expect(today.interactions).toBeGreaterThanOrEqual(1)
  })

  it('tracks device type on page view', () => {
    trackPageView()
    const analytics = loadAnalytics()
    // jsdom user agent is typically desktop-like
    expect(Object.keys(analytics.devices).length).toBeGreaterThan(0)
  })

  it('tracks referrer on page view', () => {
    trackPageView()
    const analytics = loadAnalytics()
    expect(analytics.referrers['direct']).toBeDefined()
  })

  it('resets analytics to zero state', () => {
    // Accumulate some data
    trackPageView()
    trackSectionView('test-section')
    trackInteraction('test-action')
    
    // Verify data exists before reset
    const before = loadAnalytics()
    expect(before.totalPageViews).toBeGreaterThan(0)
    
    // Reset should clear the storage key entirely
    resetAnalytics()
    
    // After reset, loadAnalytics should return zero state
    let after = loadAnalytics()
    expect(after.totalPageViews).toBe(0)
    expect(after.totalSessions).toBe(0)
    expect(Object.keys(after.sectionViews).length).toBe(0)
    expect(Object.keys(after.interactions).length).toBe(0)
    
    // Verify we can start tracking fresh
    trackPageView()
    after = loadAnalytics()
    expect(after.totalPageViews).toBe(1)
  })

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('nk-site-analytics', 'invalid json')
    const analytics = loadAnalytics()
    expect(analytics.totalPageViews).toBe(0)
  })
})
