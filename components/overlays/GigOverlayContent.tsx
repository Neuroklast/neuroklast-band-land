'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CalendarBlank, CalendarPlus, MapPin, ShareNetwork, Ticket } from '@phosphor-icons/react'
import type { Gig } from '@/lib/app-types'
import type { DecorativeTexts } from '@/lib/types'
import { formatIsoDateLong } from '@/lib/format-display-date'
import { downloadGigIcs } from '@/lib/gig-ics'
import { shareGigEvent } from '@/lib/gig-share'
import { sanitizeExternalHref } from '@/lib/sanitize-href'
import { GigStatusBadge } from '@/components/overlays/GigStatusBadge'
import { useGigStatusKind } from '@/hooks/use-gig-status-kind'
import {
  OverlayFrame,
  OverlayItem,
  OverlayReveal,
  OverlayScanImage,
} from '@/components/motion/overlay-motion'

interface GigOverlayContentProps {
  data: Gig
  artistName?: string
  decorativeTexts?: DecorativeTexts
  closing?: boolean
}

export function GigOverlayContent({
  data,
  artistName = '',
  decorativeTexts,
  closing,
}: GigOverlayContentProps) {
  const [shareFeedback, setShareFeedback] = useState<string | null>(null)
  const dataStreamLabel = decorativeTexts?.gigDataStreamLabel ?? '// EVENT.DATA.STREAM'
  const statusPrefix = decorativeTexts?.gigStatusPrefix ?? '// SYSTEM.STATUS:'
  const statusKind = useGigStatusKind({
    status: data.status,
    soldOut: data.soldOut,
    eventDate: data.date,
    startsAt: data.startsAt,
  })
  const isCancelled = statusKind === 'cancelled'
  const isSoldOut = statusKind === 'soldout'

  const handleShare = async () => {
    try {
      const result = await shareGigEvent(data, artistName)
      setShareFeedback(result === 'shared' ? 'Shared' : 'Link copied')
      window.setTimeout(() => setShareFeedback(null), 2200)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setShareFeedback('Share unavailable')
      window.setTimeout(() => setShareFeedback(null), 2200)
    }
  }

  const handleDownloadIcs = () => {
    try {
      downloadGigIcs(data, artistName)
    } catch {
      setShareFeedback('Calendar export failed')
      window.setTimeout(() => setShareFeedback(null), 2200)
    }
  }

  return (
    <OverlayReveal
      data-theme-color="card border primary"
      className="mt-8 space-y-6"
      closing={closing}
      stagger={0.05}
    >
      <div>
        <OverlayItem delay={0.04}>
          <div className="data-label mb-2">{dataStreamLabel}</div>
        </OverlayItem>
        {data.gigType ? (
          <OverlayItem delay={0.08}>
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.25em] text-primary">
              {data.gigType}
            </p>
          </OverlayItem>
        ) : null}
        {data.photoUrl ? (
          <OverlayItem className="relative mb-4 overflow-hidden" delay={0.12}>
            <OverlayScanImage
              src={data.photoUrl}
              alt={data.title || data.venue || ''}
              className="max-h-56 w-full border border-border object-cover"
            />
            <OverlayFrame />
          </OverlayItem>
        ) : null}
        <OverlayItem delay={0.16}>
          <h2
            className="mb-4 font-mono text-3xl font-bold uppercase hover-chromatic crt-flash-in sm:text-4xl md:text-5xl"
            data-text={data.title || data.venue}
          >
            {data.title || data.venue}
          </h2>
        </OverlayItem>
        <OverlayItem delay={0.2}>
          <GigStatusBadge
            variant="overlay"
            status={data.status}
            soldOut={data.soldOut}
            eventDate={data.date}
            startsAt={data.startsAt}
          />
        </OverlayItem>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <OverlayItem className="cyber-grid p-4" variant="slideLeft" delay={0.24}>
          <div className="data-label mb-2">Location</div>
          <div className="flex items-start gap-2 font-mono text-xl hover-chromatic">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />
            <a
              href={sanitizeExternalHref(
                `https://www.openstreetmap.org/search?query=${encodeURIComponent(data.location || data.venue)}`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:underline"
            >
              {data.location || data.venue}
            </a>
          </div>
          {data.streetAddress && (
            <p className="ml-7 mt-2 font-mono text-sm text-muted-foreground">
              {data.streetAddress}
              {data.postalCode && `, ${data.postalCode}`}
            </p>
          )}
        </OverlayItem>

        <OverlayItem className="cyber-grid p-4" variant="slideRight" delay={0.28}>
          <div className="data-label mb-2">Date &amp; Time</div>
          <div className="flex items-center gap-2 font-mono text-xl hover-chromatic">
            <CalendarBlank className="h-5 w-5 shrink-0 text-primary" />
            {formatIsoDateLong(data.date)}
          </div>
          {data.startsAt && (
            <p className="ml-7 mt-2 font-mono text-sm text-muted-foreground">
              {new Date(data.startsAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </OverlayItem>
      </div>

      {data.description && (
        <OverlayItem className="cyber-grid p-4" delay={0.32}>
          <div className="data-label mb-2">Info</div>
          <p className="font-mono text-sm text-foreground/90">{data.description}</p>
        </OverlayItem>
      )}

      {data.lineup && data.lineup.length > 0 && (
        <div className="cyber-grid p-4">
          <OverlayItem delay={0.36}>
            <div className="data-label mb-3">Lineup</div>
          </OverlayItem>
          <div className="flex flex-wrap gap-2">
            {data.lineup.map((artist, i) => (
              <OverlayItem key={`${artist}-${i}`} variant="pop" delay={0.4 + i * 0.05}>
                <span
                  className={`inline-block border px-3 py-1.5 font-mono text-sm transition-colors ${
                    artistName && artist.toLowerCase() === artistName.toLowerCase()
                      ? 'border-primary/50 bg-primary/20 font-bold text-primary'
                      : 'border-border bg-card text-foreground/80 hover:border-primary/30'
                  }`}
                >
                  {artist}
                </span>
              </OverlayItem>
            ))}
          </div>
        </div>
      )}

      {data.support && !data.lineup?.length && (
        <OverlayItem className="cyber-grid p-4" delay={0.36}>
          <div className="data-label mb-2">Support Acts</div>
          <p className="font-mono text-lg text-foreground/90 hover-chromatic">{data.support}</p>
        </OverlayItem>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {data.ticketUrl && !isCancelled ? (
          <OverlayItem delay={0.44}>
            <Button
              asChild
              size="lg"
              className={`min-h-[44px] w-full font-mono uppercase tracking-wider sm:w-auto ${isSoldOut ? 'pointer-events-none opacity-50' : ''}`}
            >
              <a href={sanitizeExternalHref(data.ticketUrl)} target="_blank" rel="noopener noreferrer">
                <Ticket className="mr-2 h-5 w-5" />
                <span className="hover-chromatic">{isSoldOut ? 'Sold Out' : 'Get Tickets'}</span>
              </a>
            </Button>
          </OverlayItem>
        ) : null}

        {data.eventUrl ? (
          <OverlayItem delay={0.48}>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="min-h-[44px] w-full font-mono uppercase tracking-wider sm:w-auto"
            >
              <a href={sanitizeExternalHref(data.eventUrl)} target="_blank" rel="noopener noreferrer">
                <span className="hover-chromatic">Event page</span>
              </a>
            </Button>
          </OverlayItem>
        ) : null}

        <OverlayItem delay={0.52}>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="min-h-[44px] w-full font-mono uppercase tracking-wider sm:w-auto"
            onClick={handleShare}
          >
            <ShareNetwork className="mr-2 h-5 w-5" />
            <span className="hover-chromatic">{shareFeedback ?? 'Share'}</span>
          </Button>
        </OverlayItem>

        <OverlayItem delay={0.56}>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="min-h-[44px] w-full font-mono uppercase tracking-wider sm:w-auto"
            onClick={handleDownloadIcs}
          >
            <CalendarPlus className="mr-2 h-5 w-5" />
            <span className="hover-chromatic">Add to Calendar</span>
          </Button>
        </OverlayItem>
      </div>

      <OverlayItem className="border-t border-border pt-6" delay={0.6}>
        <div className="data-label">
          {statusPrefix} [{statusKind === 'confirmed' ? 'ACTIVE' : statusKind.toUpperCase()}]
        </div>
      </OverlayItem>
    </OverlayReveal>
  )
}
