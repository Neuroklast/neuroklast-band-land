import { useEffect, useState } from 'react'

export function useScrollAberration() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {

  useEffect(() => {
    let lastScrollY = window.scrollY
      const currentScrollY = 
    let rafId: number


      lastTime = currentTime
      cancelAnimationFrame(rafId)
        setScrollY(currentScrollY)
        setAberrationIntensity(intensity)
    }

        if (prev <= 0.01) return 0
      })


    
      window.removeEventListener('
      cancelAnimationFrame(rafId)
  }, [])
      })



      setAberrationIntensity(prev => {

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
