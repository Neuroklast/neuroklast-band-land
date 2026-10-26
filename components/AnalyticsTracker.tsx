'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import type { AnalyticsConfig } from '@/lib/analytics-config'
import { useAnalytics } from '@/hooks/use-analytics'

/** Use stable, non-personal identifiers. Never record button text or URL queries. */
function interactionTarget(element: Element): string {
  const id = element.getAttribute('data-analytics-id') || element.id
  if (id && /^[a-zA-Z0-9_-]{1,80}$/.test(id)) return id
  const href = element.getAttribute('href')
  if (href) {
    try {
      const url = new URL(href, window.location.origin)
      return url.origin === window.location.origin ? url.pathname : url.hostname
    } catch { /* fall back to tag */ }
  }
  return element.tagName.toLowerCase()
}

interface AnalyticsTrackerProps {
  config: AnalyticsConfig
}

export function AnalyticsTracker({ config }: AnalyticsTrackerProps) {
  const pathname = usePathname()
  const { track, canTrack } = useAnalytics(config)
  const seenSectionsRef = useRef<Set<string>>(new Set())
  const lastPathRef = useRef<string | null>(null)

  useEffect(() => {
    if (!canTrack || !config.trackPageViews) return
    if (lastPathRef.current === pathname) return
    lastPathRef.current = pathname
    track({ type: 'page_view', target: pathname })
  }, [canTrack, config.trackPageViews, pathname, track])

  useEffect(() => {
    if (!canTrack || !config.trackEvents) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const id = entry.target.id
          if (!id || seenSectionsRef.current.has(id)) continue
          seenSectionsRef.current.add(id)
          track({ type: 'section_view', target: id })
        }
      },
      { threshold: 0.35 },
    )

    const sections = document.querySelectorAll('section[id]')
    sections.forEach((section) => observer.observe(section))

    const handleClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const clickable = target.closest('a,button,[role="button"]')
      if (!clickable) return

      // Page-relative heat coords for admin heatmap (x: 0–1 viewport, y: scroll-aware 0–2)
      const docH = Math.max(
        document.documentElement.scrollHeight,
        document.body?.scrollHeight ?? 0,
        1,
      )
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0
      const pageX = window.innerWidth > 0 ? event.clientX / window.innerWidth : 0
      const pageY = (event.clientY + scrollY) / docH

      track({
        type: 'click',
        target: interactionTarget(clickable),
        heatmap: {
          x: Math.min(1, Math.max(0, pageX)),
          y: Math.min(2, Math.max(0, pageY * 2)), // normalize long pages into 0–2 schema range
          page: pathname,
          elementTag: clickable.tagName.toLowerCase(),
        },
      })
    }

    document.addEventListener('click', handleClick, { capture: true })

    return () => {
      observer.disconnect()
      document.removeEventListener('click', handleClick, { capture: true })
    }
  }, [canTrack, config.trackEvents, pathname, track])

  useEffect(() => {
    seenSectionsRef.current.clear()
  }, [pathname])

  return null
}