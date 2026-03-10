/**
 * CustomHtmlWidget — Renders arbitrary HTML inside a sandboxed iFrame.
 *
 * Config: { html: string, title?: string, height?: number }
 *
 * The HTML is embedded via a `srcdoc` iFrame so external scripts and styles
 * are isolated from the host page.  This is suitable for Kickstarter campaign
 * embeds, custom ticket provider widgets, and similar third-party snippets.
 */
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'
import { useLocale } from '@/hooks/use-locale'

interface CustomHtmlConfig {
  html?: string
  title?: string
  height?: number
}

interface CustomHtmlWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
}

export default function CustomHtmlWidget({ widget }: CustomHtmlWidgetProps) {
  const { t } = useLocale()
  const config = (widget.config ?? {}) as CustomHtmlConfig
  const html = config.html ?? ''
  const title = config.title ?? 'Custom Embed'
  const height = typeof config.height === 'number' && config.height > 0 ? config.height : 400

  if (!html.trim()) {
    return (
      <div className="border border-primary/20 rounded p-6 text-center font-mono text-sm text-muted-foreground bg-card/30">
        <div className="text-2xl mb-2">📄</div>
        <p className="font-semibold mb-1">{t('widget.customHtml.title')}</p>
        <p className="text-xs opacity-70">
          {t('widget.customHtml.configureHint')}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <iframe
        srcDoc={html}
        title={title}
        width="100%"
        height={height}
        frameBorder="0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        loading="lazy"
        style={{ display: 'block' }}
      />
    </div>
  )
}
