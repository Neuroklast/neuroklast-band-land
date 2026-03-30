import { useState, useEffect, useRef } from 'react'
import BackgroundEffects from '../../themes/neuroklast-classic/BackgroundEffects'
import type { BackgroundEffectsSlotProps } from '@/lib/types'

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export default function NeuroklastBackgroundContainer(props: BackgroundEffectsSlotProps) {
  const [timeString, setTimeString] = useState(formatTime(new Date()))
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const [sessionId] = useState(() => `ID: NK-${Date.now().toString().slice(-6)}`)

  useEffect(() => {
    const tick = () => setTimeString(formatTime(new Date()))
    intervalRef.current = setInterval(tick, 1000)
    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(intervalRef.current)
      } else {
        setTimeString(formatTime(new Date()))
        intervalRef.current = setInterval(tick, 1000)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      clearInterval(intervalRef.current)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return <BackgroundEffects {...props} timeString={timeString} sessionId={sessionId} />
}
