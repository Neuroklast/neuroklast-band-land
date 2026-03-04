/**
 * WidgetRenderer — Central switch component that renders the correct
 * widget component for a given WidgetPlugin.
 *
 * Props:
 *   widget: WidgetPlugin  — the installed/enabled plugin instance
 *   themeSettings?: ThemeSettings — active theme for styling
 */
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'
import BandsintownWidget from './BandsintownWidget'
import SpotifyPlayerWidget from './SpotifyPlayerWidget'
import YouTubeWidget from './YouTubeWidget'
import MerchStoreWidget from './MerchStoreWidget'
import AnalyticsWidget from './AnalyticsWidget'

interface WidgetRendererProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
}

export default function WidgetRenderer({ widget, themeSettings }: WidgetRendererProps) {
  switch (widget.id) {
    case 'bandsintown':
      return <BandsintownWidget widget={widget} themeSettings={themeSettings} />
    case 'spotify-player':
      return <SpotifyPlayerWidget widget={widget} themeSettings={themeSettings} />
    case 'youtube-embed':
      return <YouTubeWidget widget={widget} themeSettings={themeSettings} />
    case 'merch-store':
      return <MerchStoreWidget widget={widget} themeSettings={themeSettings} />
    case 'analytics-dashboard':
      return <AnalyticsWidget widget={widget} themeSettings={themeSettings} />
    default:
      return (
        <div className="border border-primary/20 rounded p-6 text-center font-mono text-sm text-muted-foreground bg-card/30">
          <div className="text-2xl mb-2">🔌</div>
          <p className="font-semibold mb-1">{widget.name}</p>
          <p className="text-xs opacity-70">
            This widget type (<code className="text-xs">{widget.id}</code>) has no renderer yet.
          </p>
        </div>
      )
  }
}
