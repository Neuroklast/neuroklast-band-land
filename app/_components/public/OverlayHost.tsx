'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useOverlayTransition } from '@/components/OverlayTransition'
import { useLenisContext } from '@/contexts/LenisContext'
import { useOverlay } from '@/contexts/OverlayContext'
import { MediaOverlay } from './MediaOverlay'
import { toExplorerFiles } from './MediaExplorer'
import dynamic from 'next/dynamic'

const CyberpunkOverlay = dynamic(() => import('@/components/CyberpunkOverlay'), { ssr: false })

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
      <AnimatePresence>
        {overlay?.type === 'explorer' ? (
          <MediaOverlay
            key="media-explorer"
            files={toExplorerFiles(overlay.data.items)}
            onClose={() => {
              triggerRef.current()
              closeOverlay()
            }}
          />
        ) : null}
      </AnimatePresence>
      {overlay && overlay.type !== 'explorer' ? (
        <CyberpunkOverlay
          overlay={overlay}
          onClose={closeOverlay}
          adminSettings={undefined}
          artistName={artistName}
        />
      ) : null}
      {overlay ? element : null}
    </>
  )
}
