/**
 * DiscordWidget — Embeds the official Discord server widget.
 *
 * Config: { serverId: string, theme?: 'dark' | 'light' }
 */
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'
import { useLocale } from '@/hooks/use-locale'

interface DiscordConfig {
  serverId?: string
  theme?: 'dark' | 'light'
}

interface DiscordWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
}

export default function DiscordWidget({ widget }: DiscordWidgetProps) {
  const { t } = useLocale()
  const config = (widget.config ?? {}) as DiscordConfig

  if (!config.serverId) {
    return (
      <div className="border border-primary/20 rounded p-6 text-center font-mono text-sm text-muted-foreground bg-card/30">
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
    <div className="w-full">
      <iframe
        src={src}
        width="350"
        height="500"
        frameBorder="0"
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        title="Discord Server Widget"
        loading="lazy"
      />
    </div>
  )
}
