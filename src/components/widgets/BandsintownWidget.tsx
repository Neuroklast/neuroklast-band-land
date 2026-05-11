/**
 * BandsintownWidget — Fetches and displays upcoming shows via the Bandsintown API.
 *
 * Config:
 *   artist         — Artist name as registered on Bandsintown
 *   appId          — Bandsintown App ID (public client identifier)
 *   displayLimit   — Number of events to show (1-20, default: 5)
 *   showPastDates  — Include past events (default: false)
 *   layout         — 'list' (full details) or 'compact' (minimal, default: 'list')
 *   showTicketLinks — Show ticket purchase links (default: true)
 *   showVenueDetails — Show city/country next to venue name (default: true)
 *
 * Events are fetched via the /api/bandsintown proxy to avoid CSP/CORS issues.
 */
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'
import { useLocale } from '@/hooks/use-locale'

interface BandsintownConfig {
  artist?: string
  appId?: string
  displayLimit?: number
  showPastDates?: boolean
  layout?: 'list' | 'compact'
  showTicketLinks?: boolean
  showVenueDetails?: boolean
}

export interface BandsintownWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
  events?: BandsintownEvent[]
  loading?: boolean
  error?: string | null
}

export interface BandsintownEvent {
  id: string
  url: string
  datetime: string
  title?: string
  lineup?: string[]
  offers?: Array<{ type: string; url: string; status: string }>
  venue: {
    name: string
    city: string
    region?: string
    country: string
  }
}

/** Format an ISO datetime string to a localised short date. */
function formatEventDate(raw: string): string {
  try {
    return new Date(raw).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return raw
  }
}




export default function BandsintownWidget({ widget, themeSettings, events = [], loading = false, error = null }: BandsintownWidgetProps) {
  const { t } = useLocale()
  const config = (widget.config ?? {}) as BandsintownConfig
  const primary = themeSettings?.primary ?? 'oklch(0.50 0.22 25)'
  const borderRadius = themeSettings?.borderRadius ?? 0.125
  const radiusPx = Math.round(borderRadius * 16)

  const displayLimit = Math.min(20, Math.max(1, config.displayLimit ?? 5))
  const layout = config.layout ?? 'list'
  const showTicketLinks = config.showTicketLinks !== false
  const showVenueDetails = config.showVenueDetails !== false




  // ── Unconfigured ──────────────────────────────────────────────────────────
  if (!config.artist || !config.appId) {
    return (
      <div
        className="border border-primary/20 rounded p-6 text-center font-mono text-sm text-muted-foreground bg-card/30"
        style={{
          borderColor: `color-mix(in oklch, ${primary} 20%, transparent)`,
          borderRadius: `${radiusPx}px`,
        }}
      >
        <div className="text-2xl mb-2">🎸</div>
        <p className="font-semibold mb-1">{t('widget.bandsintown.title')}</p>
        <p className="text-xs opacity-70">{t('widget.bandsintown.configureHint')}</p>
      </div>
    )
  }

  const artistHref = `https://www.bandsintown.com/a/${encodeURIComponent(config.artist)}`

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="border border-primary/20 bg-card/30 p-4 font-mono space-y-3"
        style={{ borderRadius: `${radiusPx}px` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎸</span>
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">
            {config.artist}
          </h3>
        </div>
        <div className="space-y-2 animate-pulse">
          {Array.from({ length: Math.min(3, displayLimit) }).map((_, i) => (
            <div key={i} className="h-12 bg-primary/5 rounded" />
          ))}
        </div>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        className="border border-primary/20 bg-card/30 p-4 font-mono space-y-3"
        style={{ borderRadius: `${radiusPx}px` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎸</span>
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">
            {t('widget.bandsintown.title')}
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('widget.bandsintown.fetchError') || error}
        </p>
        <a
          href={artistHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-primary/20 border border-primary/50 text-primary text-xs font-mono tracking-wider hover:bg-primary/30 transition-colors"
          style={{ borderRadius: `${radiusPx}px` }}
        >
          {t('widget.bandsintown.viewOnBandsintown') || 'View on Bandsintown →'}
        </a>
      </div>
    )
  }

  // ── No events ─────────────────────────────────────────────────────────────
  if (events.length === 0) {
    return (
      <div
        className="border border-primary/20 bg-card/30 p-6 text-center font-mono space-y-3"
        style={{ borderRadius: `${radiusPx}px` }}
      >
        <div className="text-2xl">🎸</div>
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">
          {config.artist}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t('widget.bandsintown.noEvents') || 'No upcoming shows found.'}
        </p>
        <a
          href={artistHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-primary/20 border border-primary/50 text-primary text-xs font-mono tracking-wider hover:bg-primary/30 transition-colors"
          style={{ borderRadius: `${radiusPx}px` }}
        >
          {t('widget.bandsintown.viewOnBandsintown') || 'View on Bandsintown →'}
        </a>
      </div>
    )
  }

  // ── Event list ────────────────────────────────────────────────────────────
  return (
    <div
      className="border border-primary/20 bg-card/30 font-mono space-y-3 p-4"
      style={{ borderRadius: `${radiusPx}px` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-primary/10 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎸</span>
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">
            {config.artist}
          </h3>
        </div>
        <a
          href={artistHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
        >
          {t('widget.bandsintown.allShows') || 'All shows →'}
        </a>
      </div>

      {/* Events */}
      <ul className="space-y-2">
        {events.map((ev) => {
          const ticketOffer = ev.offers?.find((o) => o.type === 'Tickets')
          const venueLocation = showVenueDetails
            ? [ev.venue.city, ev.venue.region, ev.venue.country]
                .filter(Boolean)
                .join(', ')
            : null

          if (layout === 'compact') {
            return (
              <li key={ev.id}>
                <a
                  href={ev.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 border border-primary/10 bg-card/50 hover:bg-primary/10 transition-colors"
                  style={{ borderRadius: `${Math.max(2, radiusPx - 2)}px` }}
                >
                  <span className="text-[10px] text-muted-foreground w-20 shrink-0">
                    {formatEventDate(ev.datetime)}
                  </span>
                  <span className="text-xs text-foreground truncate flex-1">
                    {ev.venue.name}
                    {venueLocation && (
                      <span className="text-muted-foreground"> — {venueLocation}</span>
                    )}
                  </span>
                </a>
              </li>
            )
          }

          // ── Full list layout ───────────────────────────────────────────────
          return (
            <li
              key={ev.id}
              className="px-3 py-2 border border-primary/10 bg-card/50 space-y-1"
              style={{ borderRadius: `${Math.max(2, radiusPx - 2)}px` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] text-muted-foreground block">
                    {formatEventDate(ev.datetime)}
                  </span>
                  <span className="text-xs font-semibold text-foreground block truncate">
                    {ev.title || ev.venue.name}
                  </span>
                  {showVenueDetails && venueLocation && (
                    <span className="text-[10px] text-muted-foreground block">
                      📍 {ev.venue.name} — {venueLocation}
                    </span>
                  )}
                </div>
                {showTicketLinks && ticketOffer && ticketOffer.status !== 'unavailable' ? (
                  <a
                    href={ticketOffer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-2 py-1 bg-primary/20 border border-primary/50 text-primary text-[10px] font-mono tracking-wider hover:bg-primary/30 transition-colors"
                    style={{ borderRadius: `${Math.max(2, radiusPx - 2)}px` }}
                  >
                    {t('gigs.tickets') || 'TICKETS'}
                  </a>
                ) : (
                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-2 py-1 bg-primary/10 border border-primary/20 text-muted-foreground text-[10px] font-mono tracking-wider hover:bg-primary/20 transition-colors"
                    style={{ borderRadius: `${Math.max(2, radiusPx - 2)}px` }}
                  >
                    {t('widget.bandsintown.details') || 'DETAILS'}
                  </a>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

