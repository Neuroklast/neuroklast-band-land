import { useEffect, useState } from 'react'

export function useScrollAberration() {
  const [scrollY, setScrollY] = useState(0)
  const [aberrationIntensity, setAberrationIntensity] = useState(0)

  useEffect(() => {
    let rafId: number
    let lastScrollY = window.scrollY
    let lastTime = Date.now()

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const currentTime = Date.now()
      const timeDelta = Math.max(currentTime - lastTime, 1)
      const scrollDelta = Math.abs(currentScrollY - lastScrollY)
      const scrollVelocity = scrollDelta / timeDelta * 100

      lastScrollY = currentScrollY
      lastTime = currentTime

      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        setScrollY(currentScrollY)
        const intensity = Math.min(scrollVelocity / 10, 1)
        setAberrationIntensity(intensity)
      })
    }

    const decayAberration = () => {
      setAberrationIntensity((prev) => {
        if (prev <= 0.01) return 0
        return prev * 0.85
      })
      rafId = requestAnimationFrame(decayAberration)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    rafId = requestAnimationFrame(decayAberration)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return { scrollY, aberrationIntensity }
}
