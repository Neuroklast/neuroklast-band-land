/**
 * SpotifyPlayerWidget — Spotify iFrame embed.
 *
 * Config: { uri: string, type: 'playlist' | 'album' | 'track' }
 */
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'
import { useLocale } from '@/hooks/use-locale'

interface SpotifyConfig {
  uri?: string
  type?: 'playlist' | 'album' | 'track'
  theme?: 'dark' | 'light'
}

interface SpotifyPlayerWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
}

export default function SpotifyPlayerWidget({ widget, themeSettings }: SpotifyPlayerWidgetProps) {
  const { t } = useLocale()
  const config = (widget.config ?? {}) as SpotifyConfig
  const borderRadius = themeSettings?.borderRadius ?? 0.125
  const radiusPx = Math.round(borderRadius * 16)

  if (!config.uri) {
    return (
      <div
        className="border border-primary/20 rounded p-6 text-center font-mono text-sm text-muted-foreground bg-card/30"
      >
        <div className="text-2xl mb-2">🎵</div>
        <p className="font-semibold mb-1">{t('widget.spotify.title')}</p>
        <p className="text-xs opacity-70">
          {t('widget.spotify.configureHint')}
        </p>
      </div>
    )
  }

  const type = config.type ?? 'playlist'
  // Extract ID from full URI like "spotify:playlist:37i9dQZEVXbNG2KDcFcKOF"
  // or just use a plain ID string
  const uriParts = config.uri.split(':')
  const spotifyId = uriParts.length >= 3 ? uriParts[2] : config.uri
  // theme=0 → dark (default), theme=1 → light
  const themeParam = config.theme === 'light' ? '1' : '0'

  const embedUrl = `https://open.spotify.com/embed/${type}/${spotifyId}?utm_source=generator&theme=${themeParam}`

  return (
    <div className="w-full">
      <iframe
        style={{ borderRadius: `${radiusPx}px` }}
        src={embedUrl}
        width="100%"
        height="352"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title={`Spotify ${type}`}
      />
    </div>
  )
}
