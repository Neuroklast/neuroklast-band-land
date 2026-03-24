import { useState, useEffect } from 'react'
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'
import BandsintownWidget from './BandsintownWidget'
import { useLocale } from '@/hooks/use-locale'

interface BandsintownConfig {
  artist?: string
  appId?: string
  displayLimit?: number
  showPastDates?: boolean
  layout?: 'list' | 'compact'
  showTicketLinks?: boolean
  showVenueDetails?: boolean
}

interface BandsintownEvent {
  id: string
  url: string
  datetime: string
  title?: string
  lineup?: string[]
  offers?: Array<{ type: string; url: string; status: string }>
  venue: {
    name: string
    city: string
    region?: string
    country: string
  }
}

interface BandsintownWidgetContainerProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
}

export default function BandsintownWidgetContainer({ widget, themeSettings }: BandsintownWidgetContainerProps) {
  const { t } = useLocale()
  const config = (widget.config ?? {}) as BandsintownConfig
  const displayLimit = Math.min(20, Math.max(1, config.displayLimit ?? 5))

  const [events, setEvents] = useState<BandsintownEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!config.artist || !config.appId) return

    let cancelled = false
    setLoading(true)
    setError(null)

    async function fetchEvents() {
      try {
        const params = new URLSearchParams({
          artist: config.artist!,
          app_id: config.appId!,
        })
        if (config.showPastDates) params.set('include_past', 'true')

        const res = await fetch(`/api/bandsintown?${params.toString()}`)
        const data = (await res.json()) as { events?: BandsintownEvent[]; error?: string }

        if (!cancelled) {
          if (data.error) {
            setError(data.error)
          } else {
            setEvents((data.events ?? []).slice(0, displayLimit))
          }
        }
      } catch {
        if (!cancelled) setError(t('widget.bandsintown.fetchError') || 'Failed to load events')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchEvents()
    return () => { cancelled = true }
  }, [config.artist, config.appId, config.showPastDates, displayLimit, t])

  return (
    <BandsintownWidget
      widget={widget}
      themeSettings={themeSettings}
      events={events}
      loading={loading}
      error={error}
    />
  )
}
