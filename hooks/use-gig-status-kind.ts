'use client'

import { useSyncExternalStore } from 'react'
import { resolveGigStatusKind, type GigStatusKind } from '@/lib/gig-status'

function subscribe(onStoreChange: () => void): () => void {
  const id = window.setInterval(onStoreChange, 60_000)
  return () => window.clearInterval(id)
}

/** Stable within a minute so React's snapshot comparison is cheap. */
function getSnapshot(): number {
  return Math.floor(Date.now() / 60_000)
}

/** Client-only: server renders the static (non-live) status kind. */
function getServerSnapshot(): null {
  return null
}

/**
 * Derives the public gig status kind on the client. "Live" only resolves after
 * hydration so server and first client render agree.
 */
export function useGigStatusKind(input: {
  status?: string | null
  soldOut?: boolean | null
  eventDate: string
  startsAt?: string | null
}): GigStatusKind {
  const minute = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const now = minute === null ? null : new Date(minute * 60_000)
  return resolveGigStatusKind({ ...input, now })
}
