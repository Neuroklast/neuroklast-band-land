import { useEffect, useState } from 'react'

  const [aberrationIntensity, setAberra
  useEffect(() => {
  const [aberrationIntensity, setAberrationIntensity] = useState(0)

  useEffect(() => {
    let rafId: number
      rafId = requestAnimationFrame(
        const intensity = 


      setAberrationIntensity((prev) => {
        return prev * 0.85
      rafId = requestAnimationFram

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


      window.removeEventListener('scroll', handleScroll)

    }


  return { scrollY, aberrationIntensity }
}
