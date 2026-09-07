'use client'

import { useEffect, useRef, useState } from 'react'
import {
  DEFAULT_SITE_BACKGROUND_VIDEO,
  HERO_BACKGROUND_VIDEO_OPACITY,
  backgroundVideoDimOpacity,
  backgroundVideoOpacityForScroll,
} from '@/lib/background-config'
import { prefersReducedMotion, shouldDisableVideoBackground } from '@/lib/device-capability'
import { useLenisContext } from '@/contexts/LenisContext'
import { attachScrollVideoSync } from '@/lib/scroll-video-sync'

export function SiteBgVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const dimRef = useRef<HTMLDivElement>(null)
  const { lenis } = useLenisContext()
  const [on, setOn] = useState(false)

  useEffect(() => {
    if (shouldDisableVideoBackground() || prefersReducedMotion()) return
    setOn(true)
  }, [])

  useEffect(() => {
    if (!on) return
    const video = videoRef.current
    if (!video) return

    const onError = () => setOn(false)
    video.addEventListener('error', onError)

    const detach = attachScrollVideoSync({
      video,
      lenis: lenis
        ? {
            on: (e, cb) => {
              lenis.on(e, cb as (instance: { scroll: number; progress: number }) => void)
            },
            off: (e, cb) => {
              lenis.off(e, cb as (instance: { scroll: number; progress: number }) => void)
            },
            getScroll: () => lenis.scroll,
            getProgress: () => lenis.progress,
          }
        : null,
      minDeltaSec: 1 / 30,
    })

    return () => {
      video.removeEventListener('error', onError)
      detach()
    }
  }, [on, lenis])

  useEffect(() => {
    if (!on) return

    const apply = (scrollY: number) => {
      const opacity = backgroundVideoOpacityForScroll(scrollY, window.innerHeight)
      const node = dimRef.current
      if (node) node.style.background = `rgb(0 0 0 / ${backgroundVideoDimOpacity(opacity)})`
    }

    apply(lenis?.scroll ?? (window.scrollY || document.documentElement.scrollTop || 0))

    if (lenis) {
      const onScroll = (state: { scroll: number }) => apply(state.scroll)
      lenis.on('scroll', onScroll)
      return () => lenis.off('scroll', onScroll)
    }

    const onWindowScroll = () => apply(window.scrollY || document.documentElement.scrollTop || 0)
    window.addEventListener('scroll', onWindowScroll, { passive: true })
    return () => window.removeEventListener('scroll', onWindowScroll)
  }, [on, lenis])

  if (!on) return null

  const dim = backgroundVideoDimOpacity(HERO_BACKGROUND_VIDEO_OPACITY)

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 1, contain: 'layout paint' }}
    >
      <video
        ref={videoRef}
        src={DEFAULT_SITE_BACKGROUND_VIDEO}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
      />
      <div ref={dimRef} className="absolute inset-0" style={{ background: `rgb(0 0 0 / ${dim})` }} />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 65% at 50% 45%, transparent 35%, rgb(0 0 0 / 0.42) 100%)',
        }}
      />
    </div>
  )
}
