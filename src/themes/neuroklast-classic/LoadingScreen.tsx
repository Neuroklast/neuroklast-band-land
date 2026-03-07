import './styles.css'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { LoadingScreenSlotProps } from '@/lib/types'

const CODE_CHARS = '0123456789ABCDEFNEUROKLAST!@#$%&*'
const GLITCH_CHARS = '0123456789ABCDEFNEUROKLAST#@!%&*><'
const GLITCH_PROBABILITY = 0.45
const BOOT_MESSAGE_INTERVAL_MS = 600
const HEX_SCROLL_DISTANCE = -800
const TITLE = 'NEUROKLAST.SYS'

const HEX_CHARS = '0123456789ABCDEF'
function randomHexWord() {
  return '0x' + Array.from({ length: 4 }, () => HEX_CHARS[Math.floor(Math.random() * 16)]).join('')
}
const HEX_SCROLL = Array.from({ length: 24 }, () => randomHexWord()).join('  ')

const BOOT_SEQUENCE = [
  '> SCANNING NEURAL LINK...',
  '> ENCRYPTING PAYLOAD...',
  '> BYPASSING FIREWALL...',
  '> IDENTITY VERIFIED',
  '> ACCESS GRANTED',
]

const cols = Array.from({ length: 20 }, (_, i) => ({
  chars: Array.from({ length: 40 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join(''),
  dur: `${3 + (i % 5) * 0.7}s`,
  delay: `${(i * 0.2) % 2}s`,
}))

export default function NeuroklastClassicLoadingScreen({ onComplete }: LoadingScreenSlotProps) {
  const [progress, setProgress] = useState(0)
  const [glitchedTitle, setGlitchedTitle] = useState(TITLE)
  const [titleResolved, setTitleResolved] = useState(false)
  const [bootLog, setBootLog] = useState<string[]>([])
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); return 100 }
        return Math.min(prev + 2, 100)
      })
    }, 50)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => onCompleteRef.current(), 600)
      return () => clearTimeout(t)
    }
  }, [progress])

  // One-shot glitch-in for title
  useEffect(() => {
    let frame = 0
    const frames = 10
    const id = setInterval(() => {
      frame++
      if (frame < frames) {
        setGlitchedTitle(
          TITLE.split('').map((ch) =>
            ch === '.' ? '.' : Math.random() > GLITCH_PROBABILITY ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : ch
          ).join('')
        )
      } else {
        setGlitchedTitle(TITLE)
        setTitleResolved(true)
        clearInterval(id)
      }
    }, 50)
    return () => clearInterval(id)
  }, [])

  // Boot message sequence
  useEffect(() => {
    let idx = 0
    const add = () => {
      if (idx < BOOT_SEQUENCE.length) {
        const msg = BOOT_SEQUENCE[idx++]
        setBootLog((prev) => [...prev, msg])
        setTimeout(add, BOOT_MESSAGE_INTERVAL_MS)
      }
    }
    const t = setTimeout(add, 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Code-rain background */}
      <div className="theme-bg-code-rain absolute inset-0">
        {cols.map((col, i) => (
          <div key={i} className="theme-bg-code-col" style={{ animationDuration: col.dur, animationDelay: col.delay, opacity: 0.08 }}>
            {col.chars}
          </div>
        ))}
      </div>
      <div className="theme-bg-overlay absolute inset-0" />

      {/* HUD corner brackets */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-primary/60"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }} />
        <motion.div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-primary/60"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }} />
        <motion.div className="absolute bottom-12 left-6 w-8 h-8 border-b-2 border-l-2 border-primary/60"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.3 }} />
        <motion.div className="absolute bottom-12 right-6 w-8 h-8 border-b-2 border-r-2 border-primary/60"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.4 }} />
      </div>

      {/* Bottom hex scroll */}
      <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden flex items-center pointer-events-none border-t border-primary/20">
        <motion.div
          className="whitespace-nowrap font-mono text-[10px] text-primary/50 px-4"
          animate={{ x: [0, HEX_SCROLL_DISTANCE] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        >
          {HEX_SCROLL}{'  '}{HEX_SCROLL}
        </motion.div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-8 w-full max-w-sm">
        {/* Center NK monogram */}
        <div className="relative flex items-center justify-center mb-2">
          <motion.div
            className="font-mono text-5xl font-black text-primary select-none"
            style={{ animation: 'nk-hud-pulse 2s ease infinite', letterSpacing: '0.1em' }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            NK
          </motion.div>
        </div>

        {/* Glitch-in title */}
        <div
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.25rem', letterSpacing: '0.2em', color: 'var(--primary)', animation: titleResolved ? 'nk-hud-pulse 2s ease infinite' : 'none' }}
        >
          {glitchedTitle}
        </div>

        {/* Boot message log */}
        <div className="w-full min-h-[6rem] flex flex-col gap-0.5">
          <AnimatePresence>
            {bootLog.map((msg, i) => (
              <motion.div
                key={`boot-${i}`}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--primary)', opacity: 0.8 }}
              >
                {msg}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="w-full">
          <div className="w-full h-1 bg-secondary rounded-full overflow-hidden relative">
            <div className="h-full bg-primary transition-all duration-100 relative overflow-hidden" style={{ width: `${progress}%` }}>
              <motion.div
                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: 'var(--primary)', opacity: 0.7, textAlign: 'right', marginTop: '4px' }}>
            {Math.floor(progress)}%
          </div>
        </div>
      </div>
    </div>
  )
}
NeuroklastClassicLoadingScreen.displayName = 'NeuroklastClassicLoadingScreen'
