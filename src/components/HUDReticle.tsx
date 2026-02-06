import { useEffect, useState } from 'react'
import { motion, useSpring } from 'framer-motion'

export default function HUDReticle() {
  const [isActive, setIsActive] = useState(false)
  const x = useSpring(0, { stiffness: 500, damping: 28 })
  const y = useSpring(0, { stiffness: 500, damping: 28 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setIsActive(true)
      x.set(e.clientX)
      y.set(e.clientY)
    }

    const handleMouseLeave = () => {
      setIsActive(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [x, y])

  if (!isActive) return null

  return (
    <>
      <motion.div
        className="fixed pointer-events-none z-[9999] mix-blend-screen"
        style={{
          left: x,
          top: y,
          x: '-50%',
          y: '-50%',
        }}
      >
        <svg width="60" height="60" viewBox="0 0 60 60" className="drop-shadow-[0_0_8px_oklch(0.50_0.22_25)]">
          <circle
            cx="30"
            cy="30"
            r="25"
            fill="none"
            stroke="oklch(0.50 0.22 25)"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="animate-[spin_8s_linear_infinite]"
          />
          <circle
            cx="30"
            cy="30"
            r="15"
            fill="none"
            stroke="oklch(0.60 0.24 25)"
            strokeWidth="1"
            className="animate-[spin_4s_linear_infinite_reverse]"
          />
          <line x1="30" y1="0" x2="30" y2="10" stroke="oklch(0.50 0.22 25)" strokeWidth="1" />
          <line x1="30" y1="50" x2="30" y2="60" stroke="oklch(0.50 0.22 25)" strokeWidth="1" />
          <line x1="0" y1="30" x2="10" y2="30" stroke="oklch(0.50 0.22 25)" strokeWidth="1" />
          <line x1="50" y1="30" x2="60" y2="30" stroke="oklch(0.50 0.22 25)" strokeWidth="1" />
          <line x1="12" y1="12" x2="18" y2="18" stroke="oklch(0.60 0.24 25)" strokeWidth="1" />
          <line x1="48" y1="12" x2="42" y2="18" stroke="oklch(0.60 0.24 25)" strokeWidth="1" />
          <line x1="12" y1="48" x2="18" y2="42" stroke="oklch(0.60 0.24 25)" strokeWidth="1" />
          <line x1="48" y1="48" x2="42" y2="42" stroke="oklch(0.60 0.24 25)" strokeWidth="1" />
          <circle cx="30" cy="30" r="2" fill="oklch(0.50 0.22 25)" className="animate-pulse" />
        </svg>
      </motion.div>

      <motion.div
        className="fixed pointer-events-none z-[9998] mix-blend-screen"
        style={{
          left: x,
          top: y,
          x: '-50%',
          y: '-50%',
        }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120" className="opacity-30">
          <rect x="5" y="5" width="15" height="15" fill="none" stroke="oklch(0.50 0.22 25)" strokeWidth="1">
            <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
          </rect>
          <rect x="100" y="5" width="15" height="15" fill="none" stroke="oklch(0.50 0.22 25)" strokeWidth="1">
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
          </rect>
          <rect x="5" y="100" width="15" height="15" fill="none" stroke="oklch(0.50 0.22 25)" strokeWidth="1">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
          </rect>
          <rect x="100" y="100" width="15" height="15" fill="none" stroke="oklch(0.50 0.22 25)" strokeWidth="1">
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
          </rect>
        </svg>
      </motion.div>
    </>
  )
}
