'use client'

import { useEffect } from 'react'
import { useLenisContext } from '@/contexts/LenisContext'
import { useOverlay } from '@/contexts/OverlayContext'
import CyberpunkOverlay from '@/components/CyberpunkOverlay'
import { parseOverlayAnimationPool } from '@/lib/overlay-animations'

export function OverlayHost({
  overlayAnimations,
  artistName = '',
}: {
  lookId?: string
  overlayAnimation?: string
  overlayAnimations?: string[]
  artistName?: string
}) {
  const { overlay, closeOverlay } = useOverlay()
  const { lenis } = useLenisContext()
  const pool = parseOverlayAnimationPool(overlayAnimations)

  useEffect(() => {
    if (!overlay) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    lenis?.stop()
    return () => {
      document.body.style.overflow = prev
      lenis?.start()
    }
  }, [overlay, lenis])

  return (
    <CyberpunkOverlay
      overlay={overlay}
      onClose={closeOverlay}
      adminSettings={undefined}
      artistName={artistName}
      overlayAnimations={pool}
    />
  )
}
