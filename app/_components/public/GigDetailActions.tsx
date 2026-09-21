'use client'

import { useState } from 'react'
import { CalendarPlus, ShareNetwork } from '@phosphor-icons/react'
import { downloadGigIcs } from '@/lib/gig-ics'
import { shareGigEvent } from '@/lib/gig-share'
import type { Gig } from '@/lib/app-types'

interface GigDetailActionsProps {
  gig: Gig
  artistName: string
  /** Canonical URL of the detail page — shared instead of the OG image endpoint. */
  shareUrl?: string
}

/** Client-only actions on a gig detail page: calendar download + share. */
export function GigDetailActions({ gig, artistName, shareUrl }: GigDetailActionsProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle')

  async function handleShare() {
    try {
      const result = await shareGigEvent(gig, artistName, { shareUrl })
      if (result === 'copied') {
        setStatus('copied')
        window.setTimeout(() => setStatus('idle'), 2000)
      }
    } catch {
      setStatus('error')
      window.setTimeout(() => setStatus('idle'), 2500)
    }
  }

  return (
    <div className="mt-10 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => downloadGigIcs(gig, artistName)}
        className="cyber-border hover-glitch inline-flex min-h-[44px] items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em]"
      >
        <CalendarPlus className="h-4 w-4" aria-hidden />
        Add to calendar
      </button>
      <button
        type="button"
        onClick={() => void handleShare()}
        className="cyber-border hover-glitch inline-flex min-h-[44px] items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em]"
      >
        <ShareNetwork className="h-4 w-4" aria-hidden />
        {status === 'copied' ? 'Link copied' : status === 'error' ? 'Sharing unavailable' : 'Share'}
      </button>
    </div>
  )
}
