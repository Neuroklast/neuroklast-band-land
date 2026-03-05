import { useState, useEffect, startTransition } from 'react'
import { getRandomOverlayAnimation, getOverlayAnimationByName, NONE_OVERLAY_ANIMATION, type OverlayAnimation } from '@/lib/overlay-animations'
import {
  OVERLAY_LOADING_TEXT_INTERVAL_MS,
  OVERLAY_REVEAL_PHASE_DELAY_MS,
} from '@/lib/config'

const OVERLAY_LOADING_TEXTS = [
  'ACCESSING DATABASE...',
  'DECRYPTING PAYLOAD...',
  'VERIFYING CLEARANCE...',
  'LOADING ASSETS...',
  'SYNCHRONIZING...',
]

export type OverlayPhase = 'loading' | 'revealed'

export interface OverlayStateResult {
  cyberpunkOverlay: { type: string; data: unknown } | null
  setCyberpunkOverlay: (overlay: { type: string; data: unknown } | null) => void
  overlayPhase: OverlayPhase
  loadingText: string
  overlayAnimation: OverlayAnimation
}

export function useOverlayState(overlayAnimationStyle?: string): OverlayStateResult {
  const [cyberpunkOverlay, setCyberpunkOverlay] = useState<{ type: string; data: unknown } | null>(null)
  const [overlayPhase, setOverlayPhase] = useState<OverlayPhase>('loading')
  const [loadingText, setLoadingText] = useState(OVERLAY_LOADING_TEXTS[0])
  const [overlayAnimation] = useState<OverlayAnimation>(() => {
    if (overlayAnimationStyle === 'none') return NONE_OVERLAY_ANIMATION
    return getOverlayAnimationByName(overlayAnimationStyle)
  })

  useEffect(() => {
    if (!cyberpunkOverlay) return

    startTransition(() => {
      setOverlayPhase('loading')
      setLoadingText(OVERLAY_LOADING_TEXTS[0])
    })

    let idx = 0
    const txtInterval = setInterval(() => {
      idx += 1
      if (idx <= OVERLAY_LOADING_TEXTS.length - 1) {
        setLoadingText(OVERLAY_LOADING_TEXTS[idx])
      }
    }, OVERLAY_LOADING_TEXT_INTERVAL_MS)

    const revealTimer = setTimeout(() => {
      startTransition(() => setOverlayPhase('revealed'))
    }, OVERLAY_REVEAL_PHASE_DELAY_MS)

    return () => {
      clearInterval(txtInterval)
      clearTimeout(revealTimer)
    }
  }, [cyberpunkOverlay])

  return { cyberpunkOverlay, setCyberpunkOverlay, overlayPhase, loadingText, overlayAnimation }
}
