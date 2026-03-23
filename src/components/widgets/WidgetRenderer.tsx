/**
 * WidgetRenderer — Central switch component that renders the correct
 * widget component for a given WidgetPlugin.
 *
 * Props:
 *   widget: WidgetPlugin  — the installed/enabled plugin instance
 *   themeSettings?: ThemeSettings — active theme for styling
 */
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'
import { useLocale } from '@/hooks/use-locale'
import {
  BandsintownWidget,
  SpotifyPlayerWidget,
  YouTubeWidget,
  MerchStoreWidget,
  AnalyticsWidget,
  NewsletterPluginWidget,
  InstagramFeedWidget,
  SoundCloudWidget,
  AppleMusicWidget,
  CustomHtmlWidget,
  DiscordWidget,
  PatreonWidget,
  EventbriteWidget,
  SetlistFmWidget
} from './index'

interface WidgetRendererProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
}

export default function WidgetRenderer({ widget, themeSettings }: WidgetRendererProps) {
  const { t } = useLocale()
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
    case 'newsletter':
      return <NewsletterPluginWidget widget={widget} themeSettings={themeSettings} />
    case 'instagram-feed':
      return <InstagramFeedWidget widget={widget} themeSettings={themeSettings} />
    case 'soundcloud-player':
      return <SoundCloudWidget widget={widget} themeSettings={themeSettings} />
    case 'apple-music-player':
      return <AppleMusicWidget widget={widget} themeSettings={themeSettings} />
    case 'custom-html':
      return <CustomHtmlWidget widget={widget} themeSettings={themeSettings} />
    case 'discord-widget':
      return <DiscordWidget widget={widget} themeSettings={themeSettings} />
    case 'patreon-widget':
      return <PatreonWidget widget={widget} themeSettings={themeSettings} />
    case 'eventbrite-widget':
      return <EventbriteWidget widget={widget} themeSettings={themeSettings} />
    case 'setlistfm-widget':
      return <SetlistFmWidget widget={widget} themeSettings={themeSettings} />
    default:
      return (
        <div className="border border-primary/20 rounded p-6 text-center font-mono text-sm text-muted-foreground bg-card/30">
          <div className="text-2xl mb-2">🔌</div>
          <p className="font-semibold mb-1">{widget.name}</p>
          <p className="text-xs opacity-70">
            {t('widget.renderer.noRenderer').replace('{0}', widget.id)}
          </p>
        </div>
      )
  }
}
