import { useState, useEffect } from 'react'
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'
import AnalyticsWidget from './AnalyticsWidget'

interface DailyStats {
  date: string
  pageViews: number
  sectionViews: number
  interactions: number
}

interface SiteAnalytics {
  totalPageViews: number
  totalSessions: number
  avgSessionDurationMs?: number
  bounceRate?: number
  dailyStats: DailyStats[]
}

interface AnalyticsWidgetContainerProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
}

export default function AnalyticsWidgetContainer({ widget, themeSettings }: AnalyticsWidgetContainerProps) {
  const [analytics, setAnalytics] = useState<SiteAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics', { method: 'GET' })
        if (!res.ok) {
          setIsDemo(true)
          return
        }
        const data = (await res.json()) as SiteAnalytics
        if (!cancelled) {
          setAnalytics(data)
          setIsDemo(false)
        }
      } catch {
        if (!cancelled) setIsDemo(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAnalytics()
    return () => { cancelled = true }
  }, [])

  return (
    <AnalyticsWidget
      widget={widget}
      themeSettings={themeSettings}
      analytics={analytics}
      loading={loading}
      isDemo={isDemo}
    />
  )
}
