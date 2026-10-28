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

export function SiteBgVideo({
  src,
  opacity,
  enabled = true,
}: {
  src?: string
  opacity?: number
  enabled?: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { lenis } = useLenisContext()
  const [on, setOn] = useState(false)
  const [compact, setCompact] = useState(false)
  const videoSrc = src?.trim() || DEFAULT_SITE_BACKGROUND_VIDEO
  const videoOpacity = parseBackgroundVideoOpacity(opacity, DEFAULT_BACKGROUND_VIDEO_OPACITY)

  useEffect(() => {
    // Scrubbing a full-resolution MP4 downloads multiple large byte ranges.
    // Narrow mobile viewports get a CSS-only cinematic background instead.
    const media = typeof window.matchMedia === 'function'
      ? window.matchMedia('(max-width: 767px)')
      : null
    const update = () => {
      const isCompact = media?.matches ?? false
      setCompact(isCompact)
      setOn(enabled && !isCompact && !shouldDisableVideoBackground() && !prefersReducedMotion())
    }
    update()
    media?.addEventListener?.('change', update)
    return () => media?.removeEventListener?.('change', update)
  }, [enabled])

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

  if (!enabled) return null

  return (
    <>
      {compact ? (
        <div
          aria-hidden
          data-draft-target="bg-mobile-static"
          className="pointer-events-none fixed inset-0 sm:hidden"
          style={{
            zIndex: 'var(--z-bg-video, 1)',
            opacity: videoOpacity,
            background: 'radial-gradient(ellipse 85% 60% at 50% 40%, rgba(93, 7, 17, 0.25), transparent 80%), linear-gradient(145deg, #0a080a, #030305 75%)',
          }}
        />
      ) : null}
      {on ? <div
      aria-hidden
      className="pointer-events-none fixed inset-0"
      data-draft-target="bg-video-wrap"
      style={{ zIndex: 'var(--z-bg-video, 1)', contain: 'layout paint', opacity: videoOpacity }}
    >
      <video
        key={videoSrc}
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        preload="metadata"
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
    </div> : null}
    </>
  )
}
