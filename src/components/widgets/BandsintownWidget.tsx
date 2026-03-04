/**
 * BandsintownWidget — Embedded Bandsintown event feed.
 *
 * Config: { artist: string, appId: string }
 */
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'

interface BandsintownConfig {
  artist?: string
  appId?: string
}

interface BandsintownWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
}

export default function BandsintownWidget({ widget, themeSettings }: BandsintownWidgetProps) {
  const config = (widget.config ?? {}) as BandsintownConfig
  const primary = themeSettings?.primary ?? 'oklch(0.50 0.22 25)'

  if (!config.artist || !config.appId) {
    return (
      <div
        className="border border-primary/20 rounded p-6 text-center font-mono text-sm text-muted-foreground bg-card/30"
        style={{ borderColor: `color-mix(in oklch, ${primary} 20%, transparent)` }}
      >
        <div className="text-2xl mb-2">🎸</div>
        <p className="font-semibold mb-1">Bandsintown Events</p>
        <p className="text-xs opacity-70">
          Configure artist name &amp; App ID to display upcoming shows.
        </p>
      </div>
    )
  }

  const encodedArtist = encodeURIComponent(config.artist)
  const embedUrl = `https://widget.bandsintown.com/main.min.js`

  return (
    <div className="w-full font-mono">
      <a
        className="bandsintown-widget"
        href={`https://www.bandsintown.com/a/${encodedArtist}?app_id=${config.appId}&came_from=267`}
        data-artist={config.artist}
        data-app-id={config.appId}
        data-widget-width="100%"
        data-display-limit="5"
        data-separator-color="rgba(255,255,255,0.1)"
        data-text-color={primary}
        data-link-color={primary}
        data-background-color="transparent"
        data-display-past-dates="false"
      >
        {config.artist}
      </a>
      <script type="text/javascript" src={embedUrl} async />
    </div>
  )
}
