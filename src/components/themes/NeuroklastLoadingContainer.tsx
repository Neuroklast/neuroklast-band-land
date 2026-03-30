import { useState, useEffect, useRef } from 'react'
import LoadingScreen from '../../themes/neuroklast-classic/LoadingScreen'
import type { LoadingScreenSlotProps } from '@/lib/types'

export default function NeuroklastLoadingContainer({ onComplete }: LoadingScreenSlotProps) {
  const [progress, setProgress] = useState(0)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); return 100 }
        return Math.min(prev + 2, 100)
      })
    }, 50)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => {
        if (onCompleteRef.current) onCompleteRef.current()
      }, 500)
      return () => clearTimeout(t)
    }
  }, [progress])

  return <LoadingScreen onComplete={onComplete} progress={progress} />
}
