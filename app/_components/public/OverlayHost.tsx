'use client'

import { useMemo } from 'react'
import { useOverlay } from '@/contexts/OverlayContext'
import CyberpunkOverlay from '@/components/CyberpunkOverlay'
import { overlayAnimationPoolKey, parseOverlayAnimationPool } from '@/lib/overlay-animations'

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
  const poolKey = overlayAnimationPoolKey(overlayAnimations)
  const pool = useMemo(
    () => parseOverlayAnimationPool(poolKey ? poolKey.split('|') : undefined),
    [poolKey],
  )

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
