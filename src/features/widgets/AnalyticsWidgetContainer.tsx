import { useState, useEffect } from 'react'
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'
import AnalyticsWidget from '@/components/widgets/AnalyticsWidget'

interface AnalyticsWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
}

import type { SiteAnalytics } from '@/components/widgets/AnalyticsWidget'

export default function AnalyticsWidgetContainer({ widget, themeSettings }: AnalyticsWidgetProps) {
  const [analytics, setAnalytics] = useState<SiteAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics-stats')
        if (!res.ok) throw new Error('API Error')
        const data = await res.json()

        if (!cancelled) {
          if (data.demo) {
            setIsDemo(true)
            setAnalytics(null)
          } else {
            setIsDemo(false)
            setAnalytics(data as SiteAnalytics)
          }
        }
      } catch {
        if (!cancelled) {
          setIsDemo(true)
          setAnalytics(null)
        }
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
