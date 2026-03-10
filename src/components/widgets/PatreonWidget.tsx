/**
 * PatreonWidget — Showcases a Patreon page with a call-to-action link.
 *
 * Config: { creatorName: string, pageUrl: string }
 */
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'
import { useLocale } from '@/hooks/use-locale'

interface PatreonConfig {
  creatorName?: string
  pageUrl?: string
}

interface PatreonWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
}

export default function PatreonWidget({ widget }: PatreonWidgetProps) {
  const { t } = useLocale()
  const config = (widget.config ?? {}) as PatreonConfig

  if (!config.pageUrl) {
    return (
      <div className="border border-primary/20 rounded p-6 text-center font-mono text-sm text-muted-foreground bg-card/30">
        <div className="text-2xl mb-2">🎨</div>
        <p className="font-semibold mb-1">{t('widget.patreon.title')}</p>
        <p className="text-xs opacity-70">
          {t('widget.patreon.configureHint')}
        </p>
      </div>
    )
  }

  const name = config.creatorName || 'our Patreon'

  return (
    <div className="border border-primary/20 bg-card/30 p-6 text-center font-mono space-y-3">
      <div className="text-3xl">🎨</div>
      <h3 className="text-sm font-bold tracking-wider text-primary uppercase">
        {t('widget.patreon.supportTitle')}
      </h3>
      <p className="text-xs text-muted-foreground">
        {t('widget.patreon.supportDesc').replace('{0}', name)}
      </p>
      <a
        href={config.pageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-2 px-5 py-2 bg-[#ff424d]/20 border border-[#ff424d]/50 text-[#ff424d] text-xs font-mono tracking-wider hover:bg-[#ff424d]/30 transition-colors"
      >
        {t('widget.patreon.becomePatron')}
      </a>
    </div>
  )
}
