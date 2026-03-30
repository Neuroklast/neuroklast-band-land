import { useState, useEffect } from 'react'
import LoadingScreen from '../../themes/glitch-noir/LoadingScreen'
import type { LoadingScreenSlotProps } from '@/lib/types'

const BOOT_SEQUENCE = [
  '/// SYSTEM_BOOT_INIT ///',
  '[CARRIER_WAVE] FREQUENCY_LOCK...',
  '[NEURAL_LINK] ESTABLISHING...',
  '[AUDIO_MATRIX] LOADING_SAMPLES...',
  '[SIGNAL_PROC] ANALYZING_WAVEFORMS...',
  '[SYNC_CLOCK] 138 BPM LOCKED',
  '[STATUS] READY_TO_TRANSMIT',
  '/// NEUROKLAST_ONLINE ///'
]

export default function GlitchLoadingContainer({ onComplete }: LoadingScreenSlotProps) {
  const [progress, setProgress] = useState(0)
  const [messages, setMessages] = useState<string[]>([])
  const [noiseLevel, setNoiseLevel] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => {
        if (onComplete) {
          onComplete()
        }
      }, 200)
      return () => clearTimeout(t)
    }
  }, [progress, onComplete])

  useEffect(() => {
    const noiseInterval = setInterval(() => {
      setNoiseLevel(Math.random())
    }, 100)

    return () => clearInterval(noiseInterval)
  }, [])

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessages((prev) => {
        const nextIndex = prev.length
        if (nextIndex < BOOT_SEQUENCE.length) {
          return [...prev, BOOT_SEQUENCE[nextIndex]]
        }
        clearInterval(messageInterval)
        return prev
      })
    }, 400)

    return () => clearInterval(messageInterval)
  }, [])

  return <LoadingScreen onComplete={onComplete} progress={progress} messages={messages} noiseLevel={noiseLevel} />
}
