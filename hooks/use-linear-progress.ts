import { useEffect, useState } from 'react'

export function useLinearProgress(active: boolean, durationMs: number, reducedMotion = false): number {
  const [progress, setProgress] = useState(() => (active && (reducedMotion || durationMs <= 0) ? 1 : 0))

  useEffect(() => {
    let raf = 0
    if (!active) {
      raf = window.requestAnimationFrame(() => setProgress(0))
      return () => window.cancelAnimationFrame(raf)
    }
    if (reducedMotion || durationMs <= 0) {
      raf = window.requestAnimationFrame(() => setProgress(1))
      return () => window.cancelAnimationFrame(raf)
    }

    const start = performance.now()
    const tick = (now: number) => {
      const next = Math.min(1, (now - start) / durationMs)
      setProgress(next)
      if (next < 1) raf = window.requestAnimationFrame(tick)
    }
    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
  }, [active, durationMs, reducedMotion])

  return progress
}
