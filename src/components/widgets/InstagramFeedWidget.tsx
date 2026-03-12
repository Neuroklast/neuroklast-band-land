/**
 * InstagramFeedWidget — Displays a curated photo gallery (Instagram-style grid).
 *
 * Config: { imageCount?: number }
 *
 * Shows a photo grid placeholder until an Instagram connection is configured
 * via the site's OAuth settings. The `imageCount` config key controls how many
 * placeholder cells to display (default: 6).
 */
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'
import { useLocale } from '@/hooks/use-locale'
import { InstagramLogo } from '@phosphor-icons/react'

interface InstagramFeedConfig {
  imageCount?: number
}

interface InstagramFeedWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
}

export default function InstagramFeedWidget({ widget, themeSettings }: InstagramFeedWidgetProps) {
  const { t } = useLocale()
  const config = (widget.config ?? {}) as InstagramFeedConfig
  const imageCount = typeof config.imageCount === 'number' && config.imageCount > 0
    ? config.imageCount
    : 6
  const borderRadius = themeSettings?.borderRadius ?? 0.125
  const radiusPx = Math.round(borderRadius * 16)

  return (
    <div className="w-full space-y-3 font-mono">
      <h3 className="text-xs font-bold tracking-wider text-primary uppercase opacity-70">
        {t('widget.instagram.title')}
      </h3>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(3, 1fr)` }}
      >
        {Array.from({ length: imageCount }).map((_, i) => (
          <div
            key={i}
            style={{ borderRadius: `${radiusPx}px`, aspectRatio: '1' }}
            className="bg-card/50 border border-primary/10 flex items-center justify-center"
          >
            <InstagramLogo size={20} className="text-muted-foreground opacity-20" />
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground opacity-60">
        {t('widget.instagram.connectHint')}
      </p>
    </div>
  )
}
