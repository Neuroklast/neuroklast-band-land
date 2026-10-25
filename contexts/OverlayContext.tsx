'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { CyberpunkOverlayState } from '@/lib/app-types'

export type PublicOverlayState = CyberpunkOverlayState

interface OverlayContextValue {
  overlay: PublicOverlayState | null
  openOverlay: (overlay: PublicOverlayState) => void
  closeOverlay: () => void
}

const OverlayContext = createContext<OverlayContextValue | null>(null)
const NEWS_HISTORY_KEY = '__nkNewsOverlaySlug'

function newsPath(slug: string): string {
  return '/news/' + encodeURIComponent(slug)
}

const readNewsHistorySlug = (): string | null => {
  const slug: unknown = window.history.state?.[NEWS_HISTORY_KEY]
  return typeof slug === 'string' && slug.length > 0 ? slug : null
}

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<PublicOverlayState | null>(null)
  const activeOverlay = useRef<PublicOverlayState | null>(null)
  const cachedNews = useRef(new Map<string, PublicOverlayState>())
  const baseTitle = useRef<string | null>(null)

  const showOverlay = useCallback((next: PublicOverlayState | null) => {
    activeOverlay.current = next
    setOverlay(next)
    if (typeof document === 'undefined') return

    if (next?.type === 'news') {
      if (baseTitle.current === null) baseTitle.current = document.title
      document.title = next.data.title + ' | Neuroklast'
    } else if (baseTitle.current !== null) {
      document.title = baseTitle.current
      baseTitle.current = null
    }
  }, [])

  const openOverlay = useCallback((next: PublicOverlayState) => {
    if (next.type === 'news' && typeof window !== 'undefined') {
      const slug = next.data.slug
      const destination = newsPath(slug)
      cachedNews.current.set(slug, next)

      // Native History API keeps the overlay in place while providing a real,
      // server-renderable article URL for the address bar and browser history.
      if (window.location.pathname !== destination || readNewsHistorySlug() !== slug) {
        const currentState: unknown = window.history.state
        const state = currentState && typeof currentState === 'object' ? currentState : {}
        window.history.pushState({ ...state, [NEWS_HISTORY_KEY]: slug }, '', destination)
      }
    }
    showOverlay(next)
  }, [showOverlay])

  const closeOverlay = useCallback(() => {
    const current = activeOverlay.current
    if (
      typeof window !== 'undefined' &&
      current?.type === 'news' &&
      readNewsHistorySlug() === current.data.slug &&
      window.location.pathname === newsPath(current.data.slug)
    ) {
      // Back closes the overlay and restores the exact previous URL (including #news).
      // A subsequent Forward restores the article overlay from cached data.
      window.history.back()
    }
    showOverlay(null)
  }, [showOverlay])

  useEffect(() => {
    const onPopState = () => {
      const slug = readNewsHistorySlug()
      if (slug && window.location.pathname === newsPath(slug)) {
        const saved = cachedNews.current.get(slug)
        if (saved) {
          showOverlay(saved)
        } else {
          // History may outlive this React session. The real article route
          // remains valid, so reload it instead of showing the home page.
          window.location.assign(window.location.href)
        }
      } else if (activeOverlay.current?.type === 'news') {
        showOverlay(null)
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [showOverlay])

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
