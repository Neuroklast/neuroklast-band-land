import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [messages, setMessages] = useState<string[]>([])
  const [noiseLevel, setNoiseLevel] = useState(0)

  const bootSequence = [
    '/// SYSTEM_BOOT_INIT ///',
    '[CARRIER_WAVE] FREQUENCY_LOCK...',
    '[NEURAL_LINK] ESTABLISHING...',
    '[AUDIO_MATRIX] LOADING_SAMPLES...',
    '[SIGNAL_PROC] ANALYZING_WAVEFORMS...',
    '[SYNC_CLOCK] 138 BPM LOCKED',
    '[STATUS] READY_TO_TRANSMIT',
    '/// NEUROKLAST_ONLINE ///'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const noiseInterval = setInterval(() => {
      setNoiseLevel(Math.random())
    }, 100)

    return () => clearInterval(noiseInterval)
  }, [])

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessages((prev) => {
        const nextIndex = prev.length
        if (nextIndex < bootSequence.length) {
          return [...prev, bootSequence[nextIndex]]
        }
        clearInterval(messageInterval)
        return prev
      })
    }, 400)

    return () => clearInterval(messageInterval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background flex items-center justify-center"
    >
      <div className="glitch-noir-scanline-overlay" />
      <div className="glitch-noir-grain" />
      <div className="glitch-noir-static-burst" />

      <div className="absolute inset-0 pointer-events-none opacity-20">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-accent/30"
            style={{
              left: 0,
              right: 0,
              top: `${(i / 20) * 100}%`,
            }}
            animate={{
              opacity: [0, noiseLevel * 0.5, 0],
              scaleX: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 0.5,
              delay: i * 0.05,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl px-8">
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 text-6xl font-mono font-bold text-accent blur-sm opacity-30">
              NK://BOOT
            </div>
            <div className="relative text-6xl font-mono font-bold text-foreground mb-4">
              NK://BOOT
            </div>
          </motion.div>
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-12 bg-accent/50" />
            <div className="h-1 w-1 bg-accent glitch-noir-pulse" />
            <div className="h-px w-12 bg-accent/50" />
          </div>
        </div>

        <div className="space-y-1 mb-8 h-48 overflow-hidden font-mono text-sm">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: [0, 1, 0.7], x: 0 }}
              transition={{ duration: 0.2 }}
              className={`${
                i === messages.length - 1 ? 'text-accent' : 'text-muted-foreground'
              } flex items-center gap-2`}
            >
              <span className="text-accent">{'>'}</span>
              <span>{msg}</span>
              {i === messages.length - 1 && (
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="text-accent"
                >
                  _
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-muted-foreground font-mono text-xs">
            <span>[LOADING_SEQUENCE]</span>
            <span>{progress}% COMPLETE</span>
          </div>
          <div className="h-2 bg-border overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/20 to-transparent glitch-noir-flicker" />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-accent relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/30 to-transparent animate-pulse" />
              <div className="absolute right-0 top-0 w-1 h-full bg-foreground glitch-noir-flicker shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            </motion.div>
          </div>
          <div className="flex justify-between text-muted-foreground font-mono text-xs">
            <span>SIGNAL_STRENGTH: {Math.floor(progress * 0.95)}%</span>
            <span>NOISE_FLOOR: {Math.floor(noiseLevel * 20)}dB</span>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-3 font-mono text-accent items-center">
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2 }}>█</motion.span>
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}>█</motion.span>
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}>█</motion.span>
          <span className="text-muted-foreground text-xs">PROCESSING</span>
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.6 }}>█</motion.span>
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.8 }}>█</motion.span>
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 1.0 }}>█</motion.span>
        </div>
      </div>
    </motion.div>
  )
}
