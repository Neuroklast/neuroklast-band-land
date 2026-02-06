import { useEffect, useState } from 'react'

export function useScrollAberration() {
  const [scrollY, setScrollY] = useState(0)
  const [aberrationIntensity, setAberrationIntensity] = useState(0)

  useEffect(() => {
    let rafId: number
    let lastScrollY = window.scrollY
    let scrollVelocity = 0

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      scrollVelocity = Math.abs(currentScrollY - lastScrollY)
      lastScrollY = currentScrollY

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
