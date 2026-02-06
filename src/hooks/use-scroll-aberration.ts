import { useEffect, useState } from 'react'

export function useScrollAberration() {
  const [scrollY, setScrollY] = useState(0)
  const [aberrationIntensity, setAberrationIntensity] = useState(0)

  useEffect(() => {
    let lastScrollY = window.scrollY
    let rafId: number

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDelta = Math.abs(currentScrollY - lastScrollY)
      const intensity = Math.min(scrollDelta / 100, 1)

      lastScrollY = currentScrollY

      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        setScrollY(currentScrollY)
        setAberrationIntensity(intensity)
      })
    }

    const decayAberration = () => {
      setAberrationIntensity(prev => {
        if (prev <= 0.01) return 0
        return prev * 0.95
      })
    }

    const decayInterval = setInterval(decayAberration, 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearInterval(decayInterval)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return { scrollY, aberrationIntensity }
}
