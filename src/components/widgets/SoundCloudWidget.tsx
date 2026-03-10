/**
 * SoundCloudWidget — Embeds a SoundCloud track, playlist, or artist profile.
 *
 * Config: { url: string, color?: string, autoPlay?: boolean }
 */
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'
import { useLocale } from '@/hooks/use-locale'

interface SoundCloudConfig {
  url?: string
  color?: string
  autoPlay?: boolean
}

interface SoundCloudWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
}

export default function SoundCloudWidget({ widget }: SoundCloudWidgetProps) {
  const { t } = useLocale()
  const config = (widget.config ?? {}) as SoundCloudConfig

  if (!config.url) {
    return (
      <div className="border border-primary/20 rounded p-6 text-center font-mono text-sm text-muted-foreground bg-card/30">
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
  const embedSrc =
    `https://w.soundcloud.com/player/?url=${encodeURIComponent(config.url)}` +
    `&color=%23${color}&auto_play=${autoPlay}&hide_related=true&show_comments=false` +
    `&show_user=true&show_reposts=false&show_teaser=false`

  return (
    <div className="w-full">
      <iframe
        width="100%"
        height="166"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={embedSrc}
        title="SoundCloud Player"
        loading="lazy"
      />
    </div>
  )
}
