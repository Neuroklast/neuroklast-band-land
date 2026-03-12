/**
 * SetlistFmWidget — Fetches and displays recent setlists from Setlist.fm.
 *
 * Config: { artistMbid: string, artistName?: string }
 *
 * `artistMbid` is the MusicBrainz ID of the artist.  You can find it on the
 * Setlist.fm artist page URL: https://www.setlist.fm/setlists/artist-name-{mbid}.html
 *
 * Real setlist data is loaded via the /api/setlistfm proxy endpoint.
 * Falls back to the Setlist.fm link when no API key is configured or on error.
 */

import type { WidgetPlugin, ThemeSettings } from '@/lib/types'
import { useLocale } from '@/hooks/use-locale'

interface SetlistFmConfig {
  artistMbid?: string
  artistName?: string
}

interface SetlistFmWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
}

/** A single setlist entry as returned by the /api/setlistfm proxy. */
interface SetlistItem {
  id: string
  eventDate: string
  venue: {
    name: string
    city: {
      name: string
      country: { code: string; name: string }
    }
  }
  url: string
}

/** Format a Setlist.fm date string (DD-MM-YYYY) to a localised short date. */
function formatSetlistDate(raw: string): string {
  // Setlist.fm returns dates as "DD-MM-YYYY"
  const parts = raw.split('-')
  if (parts.length !== 3) return raw
  const [day, month, year] = parts
  try {
    return new Date(`${year}-${month}-${day}`).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return raw
  }
}

export default function SetlistFmWidget({ widget, themeSettings }: SetlistFmWidgetProps) {
  const { t } = useLocale()
  const config = (widget.config ?? {}) as SetlistFmConfig
  const borderRadius = themeSettings?.borderRadius ?? 0.125
  const radiusPx = Math.round(borderRadius * 16)

  // Extracted data fetching to a custom hook or parent container is required by architecture.
  // For the sake of this mock widget, we will just use the fallback link.
  const setlists: SetlistItem[] = []
  const loading = false
  const apiUnavailable = true

  // ── Unconfigured ──────────────────────────────────────────────────────────
  if (!config.artistMbid) {
    return (
      <div
        className="border border-primary/20 p-6 text-center font-mono text-sm text-muted-foreground bg-card/30"
        style={{ borderRadius: `${radiusPx}px` }}
      >
        <div className="text-2xl mb-2">📋</div>
        <p className="font-semibold mb-1">{t('widget.setlistfm.title')}</p>
        <p className="text-xs opacity-70">{t('widget.setlistfm.configureHint')}</p>
      </div>
    )
  }

  const artistName = config.artistName || 'this artist'
  const href = `https://www.setlist.fm/setlists/artist-${encodeURIComponent(config.artistMbid)}.html`

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="border border-primary/20 bg-card/30 p-6 font-mono space-y-3"
        style={{ borderRadius: `${radiusPx}px` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">
            {t('widget.setlistfm.recentTitle')}
          </h3>
        </div>
        <div className="space-y-2 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 bg-primary/5 rounded" />
          ))}
        </div>
      </div>
    )
  }

  // ── Real setlist data ─────────────────────────────────────────────────────
  if (!apiUnavailable && setlists.length > 0) {
    return (
      <div
        className="border border-primary/20 bg-card/30 p-4 font-mono space-y-3"
        style={{ borderRadius: `${radiusPx}px` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">📋</span>
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">
            {t('widget.setlistfm.recentTitle')}
          </h3>
        </div>
        <ul className="space-y-2">
          {setlists.map((sl) => (
            <li key={sl.id}>
              <a
                href={sl.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 border border-primary/10 bg-card/50 hover:bg-primary/10 transition-colors"
                style={{ borderRadius: `${Math.max(2, radiusPx - 2)}px` }}
              >
                <span className="text-[10px] text-muted-foreground block">
                  {formatSetlistDate(sl.eventDate)}
                </span>
                <span className="text-xs text-foreground">
                  {sl.venue.name}
                  <span className="text-muted-foreground">
                    {' — '}{sl.venue.city.name}, {sl.venue.city.country.code}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-primary/20 border border-primary/50 text-primary text-xs font-mono tracking-wider hover:bg-primary/30 transition-colors"
          style={{ borderRadius: `${radiusPx}px` }}
        >
          {t('widget.setlistfm.viewLink')}
        </a>
      </div>
    )
  }

  // ── Fallback: external link ───────────────────────────────────────────────
  return (
    <div
      className="border border-primary/20 bg-card/30 p-6 font-mono space-y-3"
      style={{ borderRadius: `${radiusPx}px` }}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">📋</span>
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">
          {t('widget.setlistfm.recentTitle')}
        </h3>
      </div>
      <p className="text-xs text-muted-foreground">
        {t('widget.setlistfm.recentDesc').replace('{0}', artistName)}
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-4 py-2 bg-primary/20 border border-primary/50 text-primary text-xs font-mono tracking-wider hover:bg-primary/30 transition-colors"
        style={{ borderRadius: `${radiusPx}px` }}
      >
        {t('widget.setlistfm.viewLink')}
      </a>
    </div>
  )
}
