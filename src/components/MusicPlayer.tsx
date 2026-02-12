import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, SpeakerHigh, SpeakerSlash, MusicNote } from '@phosphor-icons/react'

export interface Track {
  title: string
  src: string
}

interface MusicPlayerProps {
  tracks: Track[]
  /** Index of the track to start with */
  initialIndex?: number
}

export default function MusicPlayer({ tracks, initialIndex = 0 }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)

  const currentTrack = tracks[currentIndex]

  const play = useCallback(() => {
    audioRef.current?.play().catch(() => {})
    setIsPlaying(true)
  }, [])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const togglePlay = useCallback(() => {
    if (isPlaying) pause()
    else play()
  }, [isPlaying, play, pause])

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
    }
    setIsMuted(m => !m)
  }, [isMuted])

  const prevTrack = useCallback(() => {
    setCurrentIndex(i => (i - 1 + tracks.length) % tracks.length)
  }, [tracks.length])

  const nextTrack = useCallback(() => {
    setCurrentIndex(i => (i + 1) % tracks.length)
  }, [tracks.length])

  // Auto-play when track changes (if already playing)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load()
      if (isPlaying) {
        audioRef.current.play().catch(() => {})
      }
    }
    setProgress(0)
  }, [currentIndex, isPlaying])

  // Update progress bar
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTimeUpdate = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration)
      }
    }
    const onEnded = () => {
      nextTrack()
    }
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
    }
  }, [nextTrack])

  if (tracks.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        className="border border-primary/30 bg-card/80 backdrop-blur-sm p-4 font-mono space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <audio ref={audioRef} muted={isMuted} preload="metadata">
          <source src={currentTrack.src} type="audio/mpeg" />
        </audio>

        {/* Track title */}
        <div className="flex items-center gap-2 text-xs text-primary/70 tracking-wider">
          <MusicNote size={14} className="text-primary/50" />
          <span className="truncate uppercase">{currentTrack.title}</span>
          <span className="ml-auto text-[9px] text-primary/40">
            {currentIndex + 1}/{tracks.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-[3px] bg-primary/10 overflow-hidden cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const ratio = (e.clientX - rect.left) / rect.width
            if (audioRef.current && audioRef.current.duration) {
              audioRef.current.currentTime = ratio * audioRef.current.duration
            }
          }}
        >
          <div
            className="h-full bg-primary/60 transition-[width] duration-200"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={prevTrack}
            className="p-1.5 text-primary/60 hover:text-primary transition-colors"
            title="Previous"
          >
            <SkipBack size={18} weight="fill" />
          </button>

          <button
            onClick={togglePlay}
            className="p-2 border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
          </button>

          <button
            onClick={nextTrack}
            className="p-1.5 text-primary/60 hover:text-primary transition-colors"
            title="Next"
          >
            <SkipForward size={18} weight="fill" />
          </button>

          <button
            onClick={toggleMute}
            className="p-1.5 text-primary/60 hover:text-primary transition-colors ml-2"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <SpeakerSlash size={18} /> : <SpeakerHigh size={18} />}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
