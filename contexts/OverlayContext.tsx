'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { CyberpunkOverlayState } from '@/lib/app-types'

export type PublicOverlayState = CyberpunkOverlayState

interface OverlayContextValue {
  overlay: PublicOverlayState | null
  openOverlay: (overlay: PublicOverlayState) => void
  closeOverlay: () => void
}

const OverlayContext = createContext<OverlayContextValue | null>(null)

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<PublicOverlayState | null>(null)
  const openOverlay = useCallback((next: PublicOverlayState) => setOverlay(next), [])
  const closeOverlay = useCallback(() => setOverlay(null), [])
  const value = useMemo(
    () => ({ overlay, openOverlay, closeOverlay }),
    [overlay, openOverlay, closeOverlay],
  )
  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>
}

const EMPTY_OVERLAY: OverlayContextValue = {
  overlay: null,
  openOverlay: () => {},
  closeOverlay: () => {},
}

export function useOverlay(): OverlayContextValue {
  return useContext(OverlayContext) ?? EMPTY_OVERLAY
}
