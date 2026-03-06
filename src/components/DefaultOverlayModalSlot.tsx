/**
 * DefaultOverlayModalSlot — the default OverlayModal slot implementation.
 *
 * Wraps CyberpunkOverlayModal and manages the loading→revealed phase
 * transition internally so App.tsx just needs to pass `overlay` + `onClose`.
 */
import { useState, useEffect, startTransition } from 'react'
import CyberpunkOverlayModal from '@/components/CyberpunkOverlayModal'
import { getOverlayAnimationByName } from '@/lib/overlay-animations'
import type { OverlayModalSlotProps } from '@/lib/types'
import {
  OVERLAY_LOADING_TEXT_INTERVAL_MS,
  OVERLAY_REVEAL_PHASE_DELAY_MS,
} from '@/lib/config'

const LOADING_TEXTS = [
  'ACCESSING DATABASE...',
  'DECRYPTING PAYLOAD...',
  'VERIFYING CLEARANCE...',
  'LOADING ASSETS...',
  'SYNCHRONIZING...',
]

export default function DefaultOverlayModalSlot({ overlay, onClose, sectionLabels }: OverlayModalSlotProps) {
  const [phase, setPhase] = useState<'loading' | 'revealed'>('loading')
  const [loadingText, setLoadingText] = useState(LOADING_TEXTS[0])
  const [animation] = useState(() => getOverlayAnimationByName(undefined))

  useEffect(() => {
    if (!overlay) return

    startTransition(() => {
      setPhase('loading')
      setLoadingText(LOADING_TEXTS[0])
    })

    let idx = 0
    const txtInterval = setInterval(() => {
      idx += 1
      if (idx < LOADING_TEXTS.length) {
        setLoadingText(LOADING_TEXTS[idx])
      }
    }, OVERLAY_LOADING_TEXT_INTERVAL_MS)

    const revealTimer = setTimeout(() => {
      startTransition(() => setPhase('revealed'))
    }, OVERLAY_REVEAL_PHASE_DELAY_MS)

    return () => {
      clearInterval(txtInterval)
      clearTimeout(revealTimer)
    }
  }, [overlay])

  return (
    <CyberpunkOverlayModal
      overlay={overlay}
      phase={phase}
      loadingText={loadingText}
      animation={animation}
      onClose={onClose}
      sectionLabels={sectionLabels}
    />
  )
}
