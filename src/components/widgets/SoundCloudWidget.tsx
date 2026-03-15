/**
 * SoundCloudWidget — Embeds a SoundCloud track, playlist, or artist profile.
 *
 * Config: { url: string, color?: string, autoPlay?: boolean, showVisualPlayer?: boolean }
 *
 * `showVisualPlayer` switches from the compact waveform player (height 166)
 * to the full visual player (height 450).
 */
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'
import { useLocale } from '@/hooks/use-locale'

interface SoundCloudConfig {
  url?: string
  color?: string
  autoPlay?: boolean
  showVisualPlayer?: boolean
}

interface SoundCloudWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
}

export default function SoundCloudWidget({ widget, themeSettings }: SoundCloudWidgetProps) {
  const { t } = useLocale()
  const config = (widget.config ?? {}) as SoundCloudConfig
  const borderRadius = themeSettings?.borderRadius ?? 0.125
  const radiusPx = Math.round(borderRadius * 16)

  if (!config.url) {
    return (
      <div
        className="border border-primary/20 rounded p-6 text-center font-mono text-sm text-muted-foreground bg-card/30"
        style={{ borderRadius: `${radiusPx}px` }}
      >
        <div className="text-2xl mb-2">🎧</div>
        <p className="font-semibold mb-1">{t('widget.soundcloud.title')}</p>
        <p className="text-xs opacity-70">
          {t('widget.soundcloud.configureHint')}
        </p>
      </div>
    )
  }

  const color = (config.color ?? '#ff5500').replace('#', '')
  const autoPlay = config.autoPlay ? 'true' : 'false'
  const visual = config.showVisualPlayer ? 'true' : 'false'
  const embedHeight = config.showVisualPlayer ? 450 : 166
  const embedSrc =
    `https://w.soundcloud.com/player/?url=${encodeURIComponent(config.url)}` +
    `&color=%23${color}&auto_play=${autoPlay}&visual=${visual}` +
    `&hide_related=true&show_comments=false` +
    `&show_user=true&show_reposts=false&show_teaser=false`

  return (
    <div className="w-full overflow-hidden" style={{ borderRadius: `${radiusPx}px` }}>
      <iframe
        width="100%"
        height={embedHeight}
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={embedSrc}
        title="SoundCloud Player"
        loading="lazy"
        style={{ display: 'block' }}
      />
    </div>
  )
}
