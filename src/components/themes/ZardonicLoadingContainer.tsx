import { useState, useEffect } from 'react'
import LoadingScreen from '../../themes/zardonic-industrial/LoadingScreen'
import type { LoadingScreenSlotProps } from '@/lib/types'

const LOADING_TEXTS = [
  '> ACCESSING PROFILE...',
  '> DECRYPTING DATA...',
  '> IDENTITY VERIFIED',
]

export default function ZardonicLoadingContainer({ onComplete }: LoadingScreenSlotProps) {
  const [loadingText, setLoadingText] = useState(LOADING_TEXTS[0])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let textIdx = 0
    const textInterval = setInterval(() => {
      textIdx += 1
      if (textIdx < LOADING_TEXTS.length) {
        setLoadingText(LOADING_TEXTS[textIdx])
      }
    }, 500)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          clearInterval(textInterval)
          return 100
        }
        return prev + 2
      })
    }, 30)

    return () => {
      clearInterval(textInterval)
      clearInterval(progressInterval)
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

  return <LoadingScreen onComplete={onComplete} progress={progress} loadingText={loadingText} />
}
