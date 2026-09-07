'use client'

import { useEffect, useRef, useState } from 'react'
import {
  DEFAULT_BACKGROUND_VIDEO_OPACITY,
  DEFAULT_SITE_BACKGROUND_VIDEO,
  parseBackgroundVideoOpacity,
} from '@/lib/background-config'
import { prefersReducedMotion, shouldDisableVideoBackground } from '@/lib/device-capability'
import { useLenisContext } from '@/contexts/LenisContext'
import { attachScrollVideoSync } from '@/lib/scroll-video-sync'

export function SiteBgVideo({ opacity }: { opacity?: number }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { lenis } = useLenisContext()
  const [on, setOn] = useState(false)
  const videoOpacity = parseBackgroundVideoOpacity(opacity, DEFAULT_BACKGROUND_VIDEO_OPACITY)

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

  if (!on) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0"
      data-draft-target="bg-video-wrap"
      style={{ zIndex: 1, contain: 'layout paint', opacity: videoOpacity }}
    >
      <video
        ref={videoRef}
        src={DEFAULT_SITE_BACKGROUND_VIDEO}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        data-draft-target="bg-video"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
      />
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
