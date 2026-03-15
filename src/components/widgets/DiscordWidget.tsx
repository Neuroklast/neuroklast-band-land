/**
 * DiscordWidget — Embeds the official Discord server widget.
 *
 * Config: { serverId: string, theme?: 'dark' | 'light', height?: number }
 */
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'
import { useLocale } from '@/hooks/use-locale'

interface DiscordConfig {
  serverId?: string
  theme?: 'dark' | 'light'
  height?: number
}

interface DiscordWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
}

export default function DiscordWidget({ widget, themeSettings }: DiscordWidgetProps) {
  const { t } = useLocale()
  const config = (widget.config ?? {}) as DiscordConfig
  const borderRadius = themeSettings?.borderRadius ?? 0.125
  const radiusPx = Math.round(borderRadius * 16)
  const height = typeof config.height === 'number' && config.height > 0 ? config.height : 500

  if (!config.serverId) {
    return (
      <div
        className="border border-primary/20 rounded p-6 text-center font-mono text-sm text-muted-foreground bg-card/30"
        style={{ borderRadius: `${radiusPx}px` }}
      >
        <div className="text-2xl mb-2">💬</div>
        <p className="font-semibold mb-1">{t('widget.discord.title')}</p>
        <p className="text-xs opacity-70">
          {t('widget.discord.configureHint')}
        </p>
      </div>
    )
  }

  const theme = config.theme ?? 'dark'
  const src = `https://discord.com/widget?id=${encodeURIComponent(config.serverId)}&theme=${theme}`

  return (
    <div className="w-full overflow-hidden" style={{ borderRadius: `${radiusPx}px` }}>
      <iframe
        src={src}
        width="100%"
        height={height}
        frameBorder="0"
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        title="Discord Server Widget"
        loading="lazy"
        style={{ display: 'block' }}
      />
    </div>
  )
}
