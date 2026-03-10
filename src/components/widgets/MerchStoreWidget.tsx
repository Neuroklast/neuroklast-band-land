/**
 * MerchStoreWidget — Product grid with external shop links.
 *
 * Config: { shopUrl: string, items: Array<{ name, price, imageUrl, link }> }
 * Premium-Gate: Only available for pro tier or higher.
 */
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'
import { useLocale } from '@/hooks/use-locale'

interface MerchItem {
  name: string
  price: string
  imageUrl?: string
  link: string
}

interface MerchConfig {
  shopUrl?: string
  items?: MerchItem[]
}

interface MerchStoreWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
}

export default function MerchStoreWidget({ widget, themeSettings }: MerchStoreWidgetProps) {
  const { t } = useLocale()
  const config = (widget.config ?? {}) as MerchConfig
  const primary = themeSettings?.primary ?? 'oklch(0.50 0.22 25)'
  const borderRadius = themeSettings?.borderRadius ?? 0.125
  const radiusPx = Math.round(borderRadius * 16)

  const items = config.items ?? []

  if (!config.shopUrl && items.length === 0) {
    return (
      <div
        className="border border-primary/20 rounded p-6 text-center font-mono text-sm text-muted-foreground bg-card/30"
      >
        <div className="text-2xl mb-2">🛒</div>
        <p className="font-semibold mb-1">{t('widget.merch.title')}</p>
        <p className="text-xs opacity-70">
          {t('widget.merch.configureHint')}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {config.shopUrl && (
        <div className="text-right">
          <a
            href={config.shopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 border rounded transition-colors hover:opacity-80"
            style={{
              borderColor: `color-mix(in oklch, ${primary} 40%, transparent)`,
              color: primary,
            }}
          >
            {t('widget.merch.openShop')}
          </a>
        </div>
      )}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col border bg-card/50 overflow-hidden transition-all hover:scale-[1.02]"
              style={{
                borderColor: `color-mix(in oklch, ${primary} 20%, transparent)`,
                borderRadius: `${radiusPx}px`,
              }}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div
                  className="w-full aspect-square flex items-center justify-center text-4xl"
                  style={{ background: `color-mix(in oklch, ${primary} 10%, transparent)` }}
                >
                  🎽
                </div>
              )}
              <div className="p-2 space-y-0.5">
                <p className="text-xs font-mono font-semibold truncate">{item.name}</p>
                <p
                  className="text-xs font-mono"
                  style={{ color: primary }}
                >
                  {item.price}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
