import { useEffect, useState, useRef } from 'react'

export function useNeuroklastBackgroundState() {
  const [time, setTime] = useState(new Date())
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const [sessionId] = useState(() => `ID: NK-${Date.now().toString().slice(-6)}`)

  useEffect(() => {
    const tick = () => setTime(new Date())
    intervalRef.current = setInterval(tick, 1000)
    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(intervalRef.current)
      } else {
        setTime(new Date())
        intervalRef.current = setInterval(tick, 1000)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      clearInterval(intervalRef.current)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return { time, sessionId }
}
