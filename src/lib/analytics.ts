/** Lightweight analytics tracking using localStorage.
 *  Tracks page visits, section views, interactions, and referrers.
 *  Data is stored client-side and displayed in the admin dashboard.
 */

const STORAGE_KEY = 'nk-site-analytics'

export interface AnalyticsEvent {
  type: 'page_view' | 'section_view' | 'interaction'
  target: string
  timestamp: number
}

export interface DailyStats {
  date: string
  pageViews: number
  sectionViews: number
  interactions: number
}

export interface SiteAnalytics {
  /** Total page views since tracking began */
  totalPageViews: number
  /** Total unique sessions (approximated by day) */
  totalSessions: number
  /** Section view counts */
  sectionViews: Record<string, number>
  /** Interaction counts (clicks on releases, gigs, profiles, etc.) */
  interactions: Record<string, number>
  /** Daily stats for the last 30 days */
  dailyStats: DailyStats[]
  /** Referrer counts */
  referrers: Record<string, number>
  /** Device type counts */
  devices: Record<string, number>
  /** First tracked date */
  firstTracked?: string
  /** Last tracked date */
  lastTracked?: string
}

function emptyAnalytics(): SiteAnalytics {
  return {
    totalPageViews: 0,
    totalSessions: 0,
    sectionViews: {},
    interactions: {},
    dailyStats: [],
    referrers: {},
    devices: {},
  }
}

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function getDeviceType(): string {
  const ua = navigator.userAgent
  if (/Mobi|Android/i.test(ua)) return 'mobile'
  if (/Tablet|iPad/i.test(ua)) return 'tablet'
  return 'desktop'
}

function getReferrerDomain(): string {
  try {
    const ref = document.referrer
    if (!ref) return 'direct'
    const url = new URL(ref)
    if (url.hostname === window.location.hostname) return 'direct'
    return url.hostname
  } catch {
    return 'direct'
  }
}

/** Load analytics from localStorage */
export function loadAnalytics(): SiteAnalytics {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return emptyAnalytics()
    return JSON.parse(stored) as SiteAnalytics
  } catch {
    return emptyAnalytics()
  }
}

/** Save analytics to localStorage */
function saveAnalytics(analytics: SiteAnalytics): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(analytics))
  } catch {
    // localStorage might be full or unavailable
  }
}

/** Ensure a daily stats entry exists for today */
function ensureDailyEntry(analytics: SiteAnalytics): DailyStats {
  const today = getToday()
  let entry = analytics.dailyStats.find(d => d.date === today)
  if (!entry) {
    entry = { date: today, pageViews: 0, sectionViews: 0, interactions: 0 }
    analytics.dailyStats.push(entry)
    // Keep only last 30 days
    if (analytics.dailyStats.length > 30) {
      analytics.dailyStats = analytics.dailyStats.slice(-30)
    }
  }
  return entry
}

/** Track a page view (call once on page load) */
export function trackPageView(): void {
  const analytics = loadAnalytics()
  const today = getToday()

  analytics.totalPageViews++
  analytics.lastTracked = today
  if (!analytics.firstTracked) analytics.firstTracked = today

  const dailyEntry = ensureDailyEntry(analytics)
  dailyEntry.pageViews++

  // Track referrer
  const referrer = getReferrerDomain()
  analytics.referrers[referrer] = (analytics.referrers[referrer] || 0) + 1

  // Track device type
  const device = getDeviceType()
  analytics.devices[device] = (analytics.devices[device] || 0) + 1

  // Count unique sessions (one per day)
  const sessionKey = `nk-session-${today}`
  if (!sessionStorage.getItem(sessionKey)) {
    sessionStorage.setItem(sessionKey, '1')
    analytics.totalSessions++
  }

  saveAnalytics(analytics)
}

/** Track a section becoming visible */
export function trackSectionView(sectionId: string): void {
  const analytics = loadAnalytics()
  analytics.sectionViews[sectionId] = (analytics.sectionViews[sectionId] || 0) + 1
  const dailyEntry = ensureDailyEntry(analytics)
  dailyEntry.sectionViews++
  saveAnalytics(analytics)
}

/** Track a user interaction (click, profile open, etc.) */
export function trackInteraction(action: string): void {
  const analytics = loadAnalytics()
  analytics.interactions[action] = (analytics.interactions[action] || 0) + 1
  const dailyEntry = ensureDailyEntry(analytics)
  dailyEntry.interactions++
  saveAnalytics(analytics)
}

/** Reset all analytics data */
export function resetAnalytics(): void {
  localStorage.removeItem(STORAGE_KEY)
}
