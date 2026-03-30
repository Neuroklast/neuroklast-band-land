import { useState, useEffect } from 'react'
import LoadingScreen from '../../themes/umbrella-corp/LoadingScreen'
import type { LoadingScreenSlotProps } from '@/lib/types'

const BOOT_LINES = [
  '> INITIALIZING SECURE CONNECTION...',
  '> LOADING TACTICAL ASSETS...',
  '> ACCESS GRANTED',
]

export default function UmbrellaLoadingContainer({ onComplete }: LoadingScreenSlotProps) {
  const [progress, setProgress] = useState(0)
  const [lineIndex, setLineIndex] = useState(0)

  useEffect(() => {
    const lineTimer = setInterval(() => {
      setLineIndex((prev) => Math.min(prev + 1, BOOT_LINES.length - 1))
    }, 500)

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer)
          clearInterval(lineTimer)
          return 100
        }
        return prev + 2
      })
    }, 30)

    return () => {
      clearInterval(lineTimer)
      clearInterval(progressTimer)
    }
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

  return <LoadingScreen onComplete={onComplete} progress={progress} lineIndex={lineIndex} />
}
