'use client'

import { useEffect, useRef } from 'react'
import { useOverlayTransition } from '@/components/OverlayTransition'
import { useLenisContext } from '@/contexts/LenisContext'
import { useOverlay } from '@/contexts/OverlayContext'
import CyberpunkOverlay from '@/components/CyberpunkOverlay'
import { parseOverlayAnimationName } from '@/lib/overlay-animations'

export function OverlayHost({
  overlayAnimation,
  artistName = '',
}: {
  lookId?: string
  overlayAnimation?: string
  artistName?: string
}) {
  const { overlay, closeOverlay } = useOverlay()
  const { lenis } = useLenisContext()
  const { trigger, element } = useOverlayTransition()
  const triggerRef = useRef(trigger)
  const resolvedAnimation = parseOverlayAnimationName(overlayAnimation) ?? 'circuitBreak'

  useEffect(() => {
    triggerRef.current = trigger
  }, [trigger])

  useEffect(() => {
    if (!overlay) return
    triggerRef.current()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    lenis?.stop()
    return () => {
      document.body.style.overflow = prev
      lenis?.start()
    }
  }, [overlay, lenis])

  return (
    <>
      <CyberpunkOverlay
        overlay={overlay}
        onClose={closeOverlay}
        adminSettings={undefined}
        artistName={artistName}
        overlayAnimation={resolvedAnimation}
      />
      {overlay ? element : null}
    </>
  )
}
