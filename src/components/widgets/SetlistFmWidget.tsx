/**
 * SetlistFmWidget — Fetches and displays recent setlists from Setlist.fm.
 *
 * Config: { artistMbid: string, artistName?: string }
 *
 * `artistMbid` is the MusicBrainz ID of the artist.  You can find it on the
 * Setlist.fm artist page URL: https://www.setlist.fm/setlists/artist-name-{mbid}.html
 *
 * Because Setlist.fm does not provide an embeddable iframe widget, this
 * component renders a styled call-to-action card linking to the artist's
 * setlist page.
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

export default function SetlistFmWidget({ widget }: SetlistFmWidgetProps) {
  const { t } = useLocale()
  const config = (widget.config ?? {}) as SetlistFmConfig

  if (!config.artistMbid) {
    return (
      <div className="border border-primary/20 rounded p-6 text-center font-mono text-sm text-muted-foreground bg-card/30">
        <div className="text-2xl mb-2">📋</div>
        <p className="font-semibold mb-1">{t('widget.setlistfm.title')}</p>
        <p className="text-xs opacity-70">
          {t('widget.setlistfm.configureHint')}
        </p>
      </div>
    )
  }

  const artistName = config.artistName || 'this artist'
  const href = `https://www.setlist.fm/setlists/artist-${encodeURIComponent(config.artistMbid)}.html`

  return (
    <div className="border border-primary/20 bg-card/30 p-6 font-mono space-y-3">
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
      >
        {t('widget.setlistfm.viewLink')}
      </a>
    </div>
  )
}
