import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function CyberpunkBackground() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 hud-grid-overlay" />
      
      <div className="absolute top-4 left-4 data-readout hidden md:block">
        <div className="mb-1">SYSTEM: ONLINE</div>
        <div>TIME: {formatTime(time)}</div>
        <div className="mt-1 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ boxShadow: '0 0 6px oklch(0.50 0.22 25)' }}></div>
          <span>ACTIVE</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 data-readout hidden md:block text-right">
        <div className="mb-1">NEUROKLAST v1.0</div>
        <div>ID: NK-{Date.now().toString().slice(-6)}</div>
      </div>

      <div className="absolute bottom-4 left-4 data-readout hidden md:block">
        <div>PROTOCOL: TECHNO</div>
        <div className="mt-1">STATUS: TRANSMITTING</div>
      </div>

      <div className="absolute bottom-4 right-4 data-readout hidden md:block text-right">
        <div>FREQ: 140-180 BPM</div>
        <div className="mt-1">MODE: HARD</div>
      </div>

      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`data-stream-${i}`}
          className="absolute w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent"
          style={{
            left: `${15 + (i * 25)}%`,
            height: '60vh',
            top: '-60vh',
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ 
            y: '200vh',
            opacity: [0, 0.6, 0.6, 0],
          }}
          transition={{
            duration: 8 + i * 2,
            delay: i * 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/2 to-transparent opacity-20" />
      
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`scan-${i}`}
          className="absolute w-px bg-gradient-to-b from-transparent via-primary/15 to-transparent"
          style={{
            left: `${(i * 16.66)}%`,
            height: '100%',
          }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.12, 0],
          }}
          transition={{
            duration: 4,
            delay: i * 0.4,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,oklch(0.50_0.22_25/0.02)_0%,transparent_50%)]" />
      
      <svg className="absolute inset-0 w-full h-full opacity-5" preserveAspectRatio="none">
        <defs>
          <pattern id="hud-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.5" fill="oklch(0.50 0.22 25)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hud-dots)" />
      </svg>

      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`corner-${i}`}
          className="absolute"
          style={{
            top: i === 0 ? '20%' : i === 1 ? '50%' : '70%',
            left: i % 2 === 0 ? '10%' : '85%',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{
            duration: 3,
            delay: i * 1.5,
            repeat: Infinity,
          }}
        >
          <svg width="30" height="30" viewBox="0 0 30 30">
            <path
              d="M 0 0 L 15 0 L 0 15 Z"
              stroke="oklch(0.50 0.22 25)"
              strokeWidth="0.5"
              fill="none"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  )
}
