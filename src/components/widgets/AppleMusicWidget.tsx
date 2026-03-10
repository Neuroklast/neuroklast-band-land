/**
 * AppleMusicWidget — Embeds an Apple Music player via the official embed URL.
 *
 * Config: { embedUrl: string }
 *
 * Obtain the embed URL from the Apple Music "Share → Embed" option on any
 * song, album, or playlist.  It looks like:
 *   https://embed.music.apple.com/us/album/…
 */
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'
import { useLocale } from '@/hooks/use-locale'

interface AppleMusicConfig {
  embedUrl?: string
}

interface AppleMusicWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
}

export default function AppleMusicWidget({ widget, themeSettings }: AppleMusicWidgetProps) {
  const { t } = useLocale()
  const config = (widget.config ?? {}) as AppleMusicConfig
  const borderRadius = themeSettings?.borderRadius ?? 0.125
  const radiusPx = Math.round(borderRadius * 16)

  if (!config.embedUrl) {
    return (
      <div className="border border-primary/20 rounded p-6 text-center font-mono text-sm text-muted-foreground bg-card/30">
        <div className="text-2xl mb-2">🍎</div>
        <p className="font-semibold mb-1">{t('widget.appleMusic.title')}</p>
        <p className="text-xs opacity-70">
          {t('widget.appleMusic.configureHint')}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <iframe
        allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
        frameBorder="0"
        height="175"
        style={{
          width: '100%',
          maxWidth: '660px',
          overflow: 'hidden',
          borderRadius: `${radiusPx}px`,
          background: 'transparent',
        }}
        sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
        src={config.embedUrl}
        title="Apple Music Player"
        loading="lazy"
      />
    </div>
  )
}
