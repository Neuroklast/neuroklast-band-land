/**
 * InstagramFeedWidget — Displays a curated photo gallery (Instagram-style grid).
 *
 * Config:
 *   imageCount?  — number of placeholder cells when no images are provided (default 6, max 24)
 *   images?      — array of { url, link?, alt? } for a real image grid
 *   profileUrl?  — Instagram profile URL → shows a "View on Instagram" CTA button
 *   embedCode?   — raw embed HTML rendered in a sandboxed srcdoc iframe
 *
 * Priority: images > embedCode > profileUrl > placeholder grid
 */
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'
import { useLocale } from '@/hooks/use-locale'
import { InstagramLogo, ArrowSquareOut } from '@phosphor-icons/react'

interface InstagramImage {
  url: string
  link?: string
  alt?: string
}

interface InstagramFeedConfig {
  imageCount?: number
  images?: InstagramImage[]
  profileUrl?: string
  embedCode?: string
}

interface InstagramFeedWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
}

export default function InstagramFeedWidget({ widget, themeSettings }: InstagramFeedWidgetProps) {
  const { t } = useLocale()
  const config = (widget.config ?? {}) as InstagramFeedConfig
  const borderRadius = themeSettings?.borderRadius ?? 0.125
  const radiusPx = Math.round(borderRadius * 16)

  const cellStyle = { borderRadius: `${radiusPx}px`, aspectRatio: '1' as const }

  // ── Option 1: real images ─────────────────────────────────────────────────
  if (Array.isArray(config.images) && config.images.length > 0) {
    return (
      <div className="w-full space-y-3 font-mono">
        <h3 className="text-xs font-bold tracking-wider text-primary uppercase opacity-70">
          {t('widget.instagram.title')}
        </h3>
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {config.images.map((img, i) => {
            const inner = (
              <img
                src={img.url}
                alt={img.alt ?? `Instagram photo ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover"
                style={cellStyle}
              />
            )
            return img.link ? (
              <a
                key={i}
                href={img.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden hover:opacity-80 transition-opacity"
                style={cellStyle}
                aria-label={img.alt ?? `Instagram photo ${i + 1}`}
              >
                {inner}
              </a>
            ) : (
              <div key={i} className="overflow-hidden" style={cellStyle}>
                {inner}
              </div>
            )
          })}
        </div>
        {config.profileUrl && (
          <a
            href={config.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-primary/40 text-primary text-xs tracking-wider hover:bg-primary/10 transition-colors"
            style={{ borderRadius: `${radiusPx}px` }}
          >
            <InstagramLogo size={14} />
            {t('widget.instagram.viewOnInstagram')}
            <ArrowSquareOut size={12} />
          </a>
        )}
      </div>
    )
  }

  // ── Option 2: embed code ──────────────────────────────────────────────────
  if (config.embedCode) {
    return (
      <div className="w-full space-y-3 font-mono">
        <h3 className="text-xs font-bold tracking-wider text-primary uppercase opacity-70">
          {t('widget.instagram.title')}
        </h3>
        <iframe
          title={t('widget.instagram.title')}
          srcDoc={config.embedCode}
          sandbox="allow-scripts allow-same-origin allow-popups"
          className="w-full border-0"
          style={{ minHeight: 400, borderRadius: `${radiusPx}px` }}
          loading="lazy"
        />
        {config.profileUrl && (
          <a
            href={config.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-primary/40 text-primary text-xs tracking-wider hover:bg-primary/10 transition-colors"
            style={{ borderRadius: `${radiusPx}px` }}
          >
            <InstagramLogo size={14} />
            {t('widget.instagram.viewOnInstagram')}
            <ArrowSquareOut size={12} />
          </a>
        )}
      </div>
    )
  }

  // ── Option 3: profile CTA only ────────────────────────────────────────────
  if (config.profileUrl) {
    return (
      <div className="w-full space-y-3 font-mono">
        <h3 className="text-xs font-bold tracking-wider text-primary uppercase opacity-70">
          {t('widget.instagram.title')}
        </h3>
        <a
          href={config.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 p-6 border border-primary/20 bg-card/30 hover:bg-primary/10 transition-colors"
          style={{ borderRadius: `${radiusPx}px` }}
        >
          <InstagramLogo size={24} className="text-primary" />
          <span className="text-sm text-primary tracking-wider">
            {t('widget.instagram.viewOnInstagram')}
          </span>
          <ArrowSquareOut size={14} className="text-primary" />
        </a>
      </div>
    )
  }

  // ── Option 4: placeholder grid ────────────────────────────────────────────
  const imageCount =
    typeof config.imageCount === 'number' && config.imageCount > 0
      ? Math.min(config.imageCount, 24)
      : 6

  return (
    <div className="w-full space-y-3 font-mono">
      <h3 className="text-xs font-bold tracking-wider text-primary uppercase opacity-70">
        {t('widget.instagram.title')}
      </h3>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {Array.from({ length: imageCount }).map((_, i) => (
          <div
            key={i}
            style={cellStyle}
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
