import { Button } from '@/components/ui/button'
import type { Release } from '@/lib/app-types'
import type { SectionLabels } from '@/lib/types'
import { toDirectImageUrl } from '@/lib/image-cache'
import { onMediaImageError } from '@/lib/media-fallback'
import { formatReleaseDate } from '@/lib/format-release-date'
import { parseTrackTitle } from '@/lib/track-parser'
import { displayReleaseType } from '@/lib/release-type'
import { getVisibleStreamingLinks, formatStreamingPlatformLabel } from '@/lib/streaming-platforms'
import { sanitizeExternalHref } from '@/lib/sanitize-href'
import {
  OverlayFrame,
  OverlayItem,
  OverlayReveal,
  OverlayScanImage,
} from '@/components/motion/overlay-motion'

interface ReleaseOverlayContentProps {
  data: Release
  sectionLabels?: SectionLabels
  mainArtistName?: string
  closing?: boolean
}

/**
 * Parse the release artists from the `artists` field, the release title, or
 * the legacy `description` field. Returns a deduplicated, non-empty array.
 * The main artist is always first when present.
 */
function parseReleaseArtists(release: { artists?: string[]; description?: string; title: string }, mainArtistName: string): string[] {
  const { extractedArtists } = parseTrackTitle(release.title)

  // Prefer the explicit artists array; fall back to combining main artist + extracted
  const baseArtists =
    release.artists && release.artists.length > 0
      ? release.artists
      : [mainArtistName, ...extractedArtists].filter(Boolean)

  // Deduplicate (case-insensitive) while preserving order
  const seen = new Set<string>()
  return baseArtists.filter(a => {
    const key = a.trim().toLowerCase()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Splits a compound artist string (e.g. "Artist A & Artist B") into individual names.
 */
function splitTrackArtist(artist: string): string[] {
  return artist
    .split(/\s*,\s*|\s*&\s*|\s+and\s+/i)
    .map(s => s.trim())
    .filter(s => s.length > 0)
}

/**
 * Build the ordered artist list for a single track row.
 *
 * Rules:
 * - If the main artist IS listed on the track, they appear first (highlighted).
 * - If the main artist is NOT listed on the track, they are omitted entirely.
 * - `trackArtist` may be a compound string ("A & B") — it is split before comparison.
 * - `featuredArtists` (extracted from the title) are appended after, de-duplicated.
 * - Returns `undefined` when the result contains only the main artist alone (no line needed).
 */
function buildTrackArtistLine(
  trackArtist: string | undefined,
  featuredArtists: string[] | undefined,
  mainArtistName: string,
): string[] | undefined {
  const mainNorm = mainArtistName.trim().toLowerCase()

  // Split the compound track-artist field into individual names.
  const trackParts = trackArtist ? splitTrackArtist(trackArtist) : []

  // Determine whether the main artist is explicitly credited on this track.
  // When trackArtist is absent we assume the track belongs to the main artist.
  const trackHasMain =
    !trackArtist || trackParts.some(p => p.trim().toLowerCase() === mainNorm)

  const allArtists: string[] = []

  // Prepend main artist only when they are actually on this track
  if (mainArtistName && trackHasMain) {
    allArtists.push(mainArtistName)
  }

  // Add individual track artists that are not the main artist
  for (const part of trackParts) {
    const norm = part.toLowerCase()
    if (norm !== mainNorm && !allArtists.some(a => a.trim().toLowerCase() === norm)) {
      allArtists.push(part)
    }
  }

  // Append featured artists (from title extraction) not already in the list
  for (const fa of (featuredArtists ?? [])) {
    const norm = fa.trim().toLowerCase()
    if (!allArtists.some(a => a.trim().toLowerCase() === norm)) {
      allArtists.push(fa)
    }
  }

  // Suppress the artist line when it contains only the main artist (no extra info)
  if (allArtists.length === 0) return undefined
  if (allArtists.length === 1 && allArtists[0].trim().toLowerCase() === mainNorm) return undefined
  return allArtists
}

export function ReleaseOverlayContent({
  data,
  sectionLabels,
  mainArtistName = '',
  closing,
}: ReleaseOverlayContentProps) {
  const showType = sectionLabels?.releaseShowType !== false
  const showYear = sectionLabels?.releaseShowYear !== false
  const showDescription = sectionLabels?.releaseShowDescription !== false
  const showTracks = sectionLabels?.releaseShowTracks !== false
  const streamLabel = sectionLabels?.releaseStreamLabel ?? 'Stream & Download'
  const infoLabel = sectionLabels?.releaseInfoLabel ?? '// RELEASE.INFO.STREAM'
  const tracksLabel = sectionLabels?.releaseTracksLabel ?? 'Tracklist'
  const statusLabel = sectionLabels?.releaseStatusLabel ?? '// MEDIA.STATUS: [AVAILABLE]'

  const streamingLinks = getVisibleStreamingLinks(data.streamingLinks)
  const hasStreamLinks = streamingLinks.length > 0

  const releaseArtists = parseReleaseArtists(data, mainArtistName)
  const { cleanTitle: cleanReleaseTitle } = parseTrackTitle(data.title)
  const showReleaseArtists = releaseArtists.length > 1

  return (
    <OverlayReveal
      data-theme-color="card border accent"
      className="mt-8"
      closing={closing}
      stagger={0.05}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[300px_1fr] md:gap-8">
        <OverlayItem
          className="cyber-card relative aspect-square overflow-hidden border border-primary/30 bg-muted"
          delay={0}
        >
          {data.artwork ? (
            <OverlayScanImage
              src={toDirectImageUrl(data.artwork) || data.artwork}
              alt={data.title}
              className="glitch-image h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                void onMediaImageError(e)
              }}
            />
          ) : null}
          <OverlayFrame />
        </OverlayItem>

        <div className="min-w-0 space-y-6">
          <div>
            <OverlayItem delay={0.08}>
              <div className="data-label mb-2">{infoLabel}</div>
            </OverlayItem>
            <OverlayItem delay={0.12}>
              <h2
                className="mb-2 break-words font-mono text-2xl font-bold uppercase hover-chromatic crt-flash-in sm:text-3xl md:text-4xl"
                data-text={cleanReleaseTitle}
              >
                {cleanReleaseTitle}
              </h2>
            </OverlayItem>
            {showReleaseArtists && (
              <OverlayItem delay={0.16}>
                <p className="mt-1 font-mono text-sm">
                  {releaseArtists.map((artist, i) => (
                    <span key={artist}>
                      {i === 0 ? (
                        <span className="font-bold text-primary">{artist}</span>
                      ) : (
                        <span className="text-muted-foreground">{artist}</span>
                      )}
                      {i < releaseArtists.length - 1 && (
                        <span className="text-muted-foreground">, </span>
                      )}
                    </span>
                  ))}
                </p>
              </OverlayItem>
            )}
            {showYear && (
              <OverlayItem delay={0.2}>
                <p className="font-mono text-xl text-muted-foreground">
                  {formatReleaseDate(data.releaseDate, data.year)}
                </p>
              </OverlayItem>
            )}
            {showType && data.type && (
              <OverlayItem delay={0.24}>
                <span className="mt-1 inline-block border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-xs uppercase tracking-wider text-primary">
                  {displayReleaseType(data.type)}
                </span>
              </OverlayItem>
            )}
          </div>

          {showDescription && data.description && !showReleaseArtists && (
            <OverlayItem className="cyber-grid p-4" delay={0.28}>
              <p className="font-mono text-sm text-foreground/80">{data.description}</p>
            </OverlayItem>
          )}

          {data.customLinks && data.customLinks.length > 0 && (
            <OverlayItem className="cyber-grid p-4" delay={0.3}>
              <div className="flex flex-wrap gap-4">
                {data.customLinks.map((link, i) => (
                  <Button key={i} asChild variant="outline" className="min-h-[44px] font-mono">
                    <a href={sanitizeExternalHref(link.url)} target="_blank" rel="noopener noreferrer">
                      <span className="hover-chromatic">{link.label}</span>
                    </a>
                  </Button>
                ))}
              </div>
            </OverlayItem>
          )}

          {hasStreamLinks && (
            <OverlayItem className="cyber-grid p-4" delay={0.34}>
              <div className="data-label mb-3">{streamLabel}</div>
              <div className="flex flex-wrap gap-3">
                {streamingLinks.map((link) => (
                  <Button
                    key={`${link.platform}-${link.url}`}
                    asChild
                    variant="outline"
                    className="min-h-[44px] font-mono"
                  >
                    <a href={sanitizeExternalHref(link.url)} target="_blank" rel="noopener noreferrer">
                      <span className="hover-chromatic">
                        {formatStreamingPlatformLabel(link.platform)}
                      </span>
                    </a>
                  </Button>
                ))}
              </div>
            </OverlayItem>
          )}

          {showTracks && data.tracks && data.tracks.length > 0 && (
            <OverlayItem className="cyber-grid p-4" delay={0.38}>
              <div className="data-label mb-3">{tracksLabel}</div>
              <ol className="max-h-[40vh] space-y-2 overflow-y-auto overscroll-contain pr-1 md:max-h-none md:space-y-1">
                {data.tracks.map((track, i) => {
                  const rawTitle = typeof track?.title === 'string' ? track.title : ''
                  if (!rawTitle.trim()) return null

                  const { cleanTitle, extractedArtists } = parseTrackTitle(rawTitle)
                  const allFeaturedArtists = [...(track.featuredArtists || []), ...extractedArtists]

                  return (
                    <li
                      key={`${i}-${rawTitle}`}
                      className="flex items-start gap-3 py-1 font-mono text-sm text-foreground/80 md:text-sm"
                    >
                      <span className="mt-0.5 w-5 shrink-0 text-right text-primary/50">{i + 1}.</span>
                      <div className="min-w-0 flex-1">
                        <span className="block">{cleanTitle}</span>
                        {(() => {
                          const artistLine = buildTrackArtistLine(
                            track.artist,
                            allFeaturedArtists,
                            mainArtistName,
                          )
                          if (!artistLine || artistLine.length === 0) return null
                          return (
                            <span className="mt-0.5 flex flex-wrap gap-x-0.5 text-xs">
                              {artistLine.map((artist, ai) => (
                                <span key={artist}>
                                  {artist.trim().toLowerCase() === mainArtistName.trim().toLowerCase() ? (
                                    <span className="font-bold text-primary">{artist}</span>
                                  ) : (
                                    <span className="text-muted-foreground">{artist}</span>
                                  )}
                                  {ai < artistLine.length - 1 && (
                                    <span className="text-muted-foreground">, </span>
                                  )}
                                </span>
                              ))}
                            </span>
                          )
                        })()}
                      </div>
                      {track.duration && (
                        <span className="mt-0.5 shrink-0 text-xs text-muted-foreground">
                          {track.duration}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ol>
            </OverlayItem>
          )}

          <OverlayItem className="border-t border-border pt-4" delay={0.44}>
            <div className="data-label">{statusLabel}</div>
          </OverlayItem>
        </div>
      </div>
    </OverlayReveal>
  )
}
