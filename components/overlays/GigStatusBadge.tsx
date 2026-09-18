'use client'

import { useLocale } from '@/contexts/LocaleContext'
import type { GigStatusKind } from '@/lib/gig-status'
import { useGigStatusKind } from '@/hooks/use-gig-status-kind'

const KIND_STYLES: Record<GigStatusKind, string> = {
  cancelled: 'border-destructive/50 bg-destructive/20 text-destructive',
  soldout: 'border-destructive/40 bg-destructive/15 text-destructive',
  live: 'border-primary/60 bg-primary/20 text-primary',
  announced: 'border-border bg-muted/40 text-muted-foreground',
  confirmed: 'border-border bg-muted/30 text-muted-foreground',
}

const KIND_LABEL_KEYS: Record<GigStatusKind, string> = {
  cancelled: 'gigs.statusCancelled',
  soldout: 'gigs.statusSoldOut',
  live: 'gigs.statusLive',
  announced: 'gigs.statusAnnounced',
  confirmed: 'gigs.statusConfirmed',
}

interface GigStatusBadgeProps {
  status?: string | null
  soldOut?: boolean | null
  eventDate: string
  startsAt?: string | null
  /** `card` is compact for list items, `overlay` is used in the event dialog. */
  variant?: 'card' | 'overlay'
  className?: string
}

/** Public event status chip (cancelled / sold out / live / announced / confirmed). */
export function GigStatusBadge({
  status,
  soldOut,
  eventDate,
  startsAt,
  variant = 'card',
  className,
}: GigStatusBadgeProps) {
  const { t } = useLocale()
  const kind = useGigStatusKind({ status, soldOut, eventDate, startsAt })
  const prominent = kind === 'cancelled' || kind === 'soldout' || kind === 'live'
  const size = variant === 'overlay' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px]'

  return (
    <span
      suppressHydrationWarning
      data-gig-status={kind}
      className={`inline-flex items-center gap-1.5 border font-mono uppercase tracking-widest ${size} ${KIND_STYLES[kind]} ${
        prominent ? '' : 'opacity-80'
      } ${className ?? ''}`}
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full bg-current ${kind === 'live' ? 'animate-pulse' : ''}`}
      />
      {t(KIND_LABEL_KEYS[kind])}
    </span>
  )
}
