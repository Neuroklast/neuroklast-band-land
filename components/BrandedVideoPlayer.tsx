'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from 'lucide-react'

type BrandedVideoPlayerProps = {
  src: string
  poster?: string
  title?: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '0:00'
  const total = Math.floor(seconds)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

/** Reusable, accessible first-party player for product demos and other editorial videos. */
export function BrandedVideoPlayer({
  src, poster, title = 'Video', className = '', autoPlay = false, muted = false,
}: BrandedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)
  const [isMuted, setIsMuted] = useState(muted)
  const [fullscreen, setFullscreen] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    setPlaying(false)
    setCurrent(0)
    setDuration(0)
    setError(false)
  }, [src])

  const togglePlay = useCallback(async () => {
    const video = videoRef.current
    if (!video) return
    if (!video.paused) {
      video.pause()
      return
    }
    try {
      await video.play()
    } catch {
      setPlaying(false)
    }
  }, [])

  const toggleFullscreen = async () => {
    const container = containerRef.current
    if (!container) return
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await container.requestFullscreen()
    } catch {
      // Unsupported environments keep inline playback available.
    }
  }

  return (
    <div
      ref={containerRef}
      className={`group relative overflow-hidden rounded-lg border border-white/15 bg-black text-white shadow-[0_0_28px_rgba(0,0,0,0.35)] ${className}`}
      aria-label={title}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault()
          void togglePlay()
        }
      }}
      tabIndex={0}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        autoPlay={autoPlay}
        muted={isMuted}
        className="aspect-video w-full bg-black object-contain"
        onClick={() => void togglePlay()}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onVolumeChange={(event) => setIsMuted(event.currentTarget.muted)}
        onError={() => setError(true)}
        aria-label={title}
      />
      {error ? (
        <div role="alert" className="absolute inset-0 flex items-center justify-center bg-black/85 p-6 text-center text-sm text-white/80">
          Das Video konnte nicht geladen werden.
        </div>
      ) : (
        <>
          {!playing && (
            <button type="button" onClick={() => void togglePlay()} aria-label="Video abspielen"
              className="absolute left-1/2 top-[44%] grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-black/70 text-white transition hover:border-red-500 hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              <Play size={24} fill="currentColor" />
            </button>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent px-3 pb-3 pt-8 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
            <input type="range" min={0} max={duration || 0} step="0.1" value={Math.min(current, duration || 0)}
              onChange={(event) => { if (videoRef.current) videoRef.current.currentTime = Number(event.target.value) }}
              aria-label="Videoposition" className="w-full accent-red-600" />
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => void togglePlay()} aria-label={playing ? 'Pausieren' : 'Abspielen'} className="focus-visible:outline-2 focus-visible:outline-white">
                {playing ? <Pause size={19} /> : <Play size={19} />}
              </button>
              <span className="text-xs tabular-nums text-white/75">{formatTime(current)} / {formatTime(duration)}</span>
              <div className="flex-1" />
              <button type="button" onClick={() => { if (videoRef.current) videoRef.current.muted = !videoRef.current.muted }}
                aria-label={isMuted ? 'Ton einschalten' : 'Stummschalten'} className="focus-visible:outline-2 focus-visible:outline-white">
                {isMuted ? <VolumeX size={19} /> : <Volume2 size={19} />}
              </button>
              <button type="button" onClick={() => void toggleFullscreen()} aria-label={fullscreen ? 'Vollbild verlassen' : 'Vollbild'}
                className="focus-visible:outline-2 focus-visible:outline-white">
                {fullscreen ? <Minimize size={19} /> : <Maximize size={19} />}
              </button>
            </div>
          </div>
        </>
      )}
      <FullscreenListener onChange={setFullscreen} />
    </div>
  )
}

function FullscreenListener({ onChange }: { onChange: (value: boolean) => void }) {
  useEffect(() => {
    const handler = () => onChange(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [onChange])
  return null
}
