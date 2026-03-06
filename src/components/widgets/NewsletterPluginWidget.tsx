/**
 * NewsletterPluginWidget — Widget-plugin wrapper around the NewsletterWidget
 * component so it can be installed, enabled, and configured via the store.
 *
 * Config: { title?, description?, placeholder?, buttonText? }
 */
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'
import NewsletterWidget from '@/components/NewsletterWidget'

interface NewsletterConfig {
  title?: string
  description?: string
  placeholder?: string
  buttonText?: string
}

interface NewsletterPluginWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
}

export default function NewsletterPluginWidget({ widget }: NewsletterPluginWidgetProps) {
  const config = (widget.config ?? {}) as NewsletterConfig
  return (
    <div className="w-full py-4 px-2">
      <NewsletterWidget
        enabled
        title={config.title || undefined}
        description={config.description || undefined}
        placeholder={config.placeholder || undefined}
        buttonText={config.buttonText || undefined}
        source="widget-store"
      />
    </div>
  )
}
