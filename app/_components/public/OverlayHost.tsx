'use client'

import { useEffect, useRef } from 'react'
import { useOverlayTransition } from '@/components/OverlayTransition'
import { useLenisContext } from '@/contexts/LenisContext'
import { useOverlay } from '@/contexts/OverlayContext'
import CyberpunkOverlay from '@/components/CyberpunkOverlay'

export function OverlayHost({ artistName = '' }: { lookId?: string; artistName?: string }) {
  const { overlay, closeOverlay } = useOverlay()
  const { lenis } = useLenisContext()
  const { trigger, element } = useOverlayTransition()
  const triggerRef = useRef(trigger)

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
      />
      {overlay ? element : null}
    </>
  )
}
