import { useState, useEffect } from 'react'
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'
import SetlistFmWidget from '@/components/widgets/SetlistFmWidget'

interface SetlistFmConfig {
  artistMbid?: string
  artistName?: string
}

interface SetlistItem {
  id: string
  eventDate: string
  venue: {
    name: string
    city: {
      name: string
      country: { code: string; name: string }
    }
  }
  url: string
}

interface SetlistFmWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
}

export default function SetlistFmWidgetContainer({ widget, themeSettings }: SetlistFmWidgetProps) {
  const config = (widget.config ?? {}) as SetlistFmConfig

  const [setlists, setSetlists] = useState<SetlistItem[]>([])
  const [loading, setLoading] = useState(false)
  const [apiUnavailable, setApiUnavailable] = useState(false)

  useEffect(() => {
    if (!config.artistMbid) return

    let cancelled = false
    setLoading(true)
    setApiUnavailable(false)

    async function fetchSetlists() {
      try {
        const res = await fetch(
          `/api/setlistfm?mbid=${encodeURIComponent(config.artistMbid!)}`,
        )
        const data = (await res.json()) as { setlists: SetlistItem[]; error?: string }

        if (!cancelled) {
          if (data.error || !Array.isArray(data.setlists) || data.setlists.length === 0) {
            setApiUnavailable(true)
          } else {
            setSetlists(data.setlists.slice(0, 5))
          }
        }
      } catch {
        if (!cancelled) setApiUnavailable(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchSetlists()
    return () => { cancelled = true }
  }, [config.artistMbid])

  return (
    <SetlistFmWidget
      widget={widget}
      themeSettings={themeSettings}
      setlists={setlists}
      loading={loading}
      apiUnavailable={apiUnavailable}
    />
  )
}
