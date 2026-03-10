/**
 * EventbriteWidget — Embeds Eventbrite event listings via the official embed button.
 *
 * Config: { organizerId: string, eventId?: string }
 *
 * When only `organizerId` is provided, all public events for that organiser are shown.
 * When `eventId` is also provided, a single event checkout widget is shown.
 */
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'
import { useLocale } from '@/hooks/use-locale'

interface EventbriteConfig {
  organizerId?: string
  eventId?: string
}

interface EventbriteWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
}

export default function EventbriteWidget({ widget }: EventbriteWidgetProps) {
  const { t } = useLocale()
  const config = (widget.config ?? {}) as EventbriteConfig

  if (!config.organizerId && !config.eventId) {
    return (
      <div className="border border-primary/20 rounded p-6 text-center font-mono text-sm text-muted-foreground bg-card/30">
        <div className="text-2xl mb-2">🎟️</div>
        <p className="font-semibold mb-1">{t('widget.eventbrite.title')}</p>
        <p className="text-xs opacity-70">
          {t('widget.eventbrite.configureHint')}
        </p>
      </div>
    )
  }

  const src = config.eventId
    ? `https://www.eventbrite.com/e/${encodeURIComponent(config.eventId)}/`
    : `https://www.eventbrite.com/o/${encodeURIComponent(config.organizerId as string)}/`

  return (
    <div className="w-full">
      <iframe
        src={src}
        width="100%"
        height="500"
        frameBorder="0"
        scrolling="auto"
        title="Eventbrite Events"
        loading="lazy"
      />
    </div>
  )
}
