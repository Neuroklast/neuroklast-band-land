'use client'

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
  const pool = parseOverlayAnimationPool(overlayAnimations)

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
