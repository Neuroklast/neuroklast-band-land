/**
 * DefaultOverlayModalSlot — the default OverlayModal slot implementation.
 *
 * Wraps CyberpunkOverlayModal and manages the loading→revealed phase
 * transition internally so App.tsx just needs to pass `overlay` + `onClose`.
 */
import { useState, useEffect, startTransition } from 'react'
import CyberpunkOverlayModal from '@/components/CyberpunkOverlayModal'
import { getOverlayAnimationByName, NONE_OVERLAY_ANIMATION, applySpeedFactor } from '@/lib/overlay-animations'
import type { OverlayModalSlotProps } from '@/lib/types'
import {
  OVERLAY_LOADING_TEXT_INTERVAL_MS,
  OVERLAY_REVEAL_PHASE_DELAY_MS,
} from '@/lib/config'

const DEFAULT_LOADING_TEXTS = [
  'ACCESSING DATABASE...',
  'DECRYPTING PAYLOAD...',
  'VERIFYING CLEARANCE...',
  'LOADING ASSETS...',
  'SYNCHRONIZING...',
]

export default function DefaultOverlayModalSlot({ overlay, onClose, sectionLabels, themeSettings, activeThemePkg }: OverlayModalSlotProps) {
  const loadingTexts = themeSettings?.modalLoadingMessages?.length
    ? themeSettings.modalLoadingMessages
    : DEFAULT_LOADING_TEXTS

  const [phase, setPhase] = useState<'loading' | 'revealed'>('loading')
  const [loadingText, setLoadingText] = useState(loadingTexts[0])
  const [animation] = useState(() => {
    const style = themeSettings?.overlayAnimationStyle
    const fallback = activeThemePkg?.defaultModalAnimation

    let anim
    if (style === 'none') {
      anim = NONE_OVERLAY_ANIMATION
    } else if (style && style !== 'random') {
      anim = getOverlayAnimationByName(style)
    } else if (!style && fallback && fallback !== 'random') {
      anim = fallback === 'none' ? NONE_OVERLAY_ANIMATION : getOverlayAnimationByName(fallback)
    } else {
      anim = getOverlayAnimationByName(undefined)
    }

    const speed = themeSettings?.overlayAnimationSpeed ?? 1
    return applySpeedFactor(anim, speed)
  })

  useEffect(() => {
    if (!overlay) return

    startTransition(() => {
      setPhase('loading')
      setLoadingText(loadingTexts[0])
    })

    let idx = 0
    const txtInterval = setInterval(() => {
      idx += 1
      if (idx < loadingTexts.length) {
        setLoadingText(loadingTexts[idx])
      }
    }, OVERLAY_LOADING_TEXT_INTERVAL_MS)

    const revealTimer = setTimeout(() => {
      startTransition(() => setPhase('revealed'))
    }, OVERLAY_REVEAL_PHASE_DELAY_MS)

    return () => {
      clearInterval(txtInterval)
      clearTimeout(revealTimer)
    }
  }, [overlay, loadingTexts])

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
