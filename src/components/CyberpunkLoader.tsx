import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import logoImage from '@/assets/images/baphomet no text.svg'
import {
  LOADER_GLITCH_PROBABILITY,
  LOADER_GLITCH_DURATION_MS,
  LOADER_GLITCH_INTERVAL_MS,
  LOADER_PROGRESS_INCREMENT_MULTIPLIER,
  LOADER_COMPLETE_DELAY_MS,
  LOADER_PROGRESS_INTERVAL_MS,
} from '@/lib/config'

interface CyberpunkLoaderProps {
  onLoadComplete: () => void
}

const hackingTexts = [
  '> INITIALIZING NEURAL INTERFACE...',
  '> LOADING CORE MODULES...',
  '> ESTABLISHING SECURE LINK...',
  '> DECRYPTING DATASTREAM...',
  '> COMPILING AUDIO ENGINE...',
  '> SYNCING FREQUENCY MATRIX...',
  '> ACTIVATING HUD OVERLAY...',
  '> LOADING VISUAL CORTEX...',
  '> PROCESSING SIGNAL CHAIN...',
  '> CALIBRATING BPM RESONANCE...',
  '> FINALIZING BOOT SEQUENCE...',
  '> SYSTEM ONLINE // ACCESS GRANTED'
]

const codeFragments = [
  'fn init_neural() -> Result<()> {',
  '  let freq = 150.0_f64;',
  '  signal::process(bpm);',
  '  audio.connect(output)?;',
  '  hud.render(frame)?;',
  'const NK = 0xFF2222;',
  'mov eax, [neuro+0x1A]',
  'jmp 0xDEADBEEF',
  'syscall.exec("init")',
  '  decrypt(stream, key);',
  'class Neuroklast extends Core {',
  '  this.bpm = 150;',
  '  this.mode = "DARK";',
  '00110101 01001110 01001011',
  'KERNEL: audio_engine [OK]',
  'SUBSYS: hud_display [OK]',
  'NODE: freq_matrix v2.0.1',
  'HASH: 0xA3F7B2C1D8E9',
  '██████░░░░ 60%',
  '> chmod +x neuroklast',
  'export NK_MODE=ACTIVATED',
]

export default function CyberpunkLoader({ onLoadComplete }: CyberpunkLoaderProps) {
  const [progress, setProgress] = useState(0)
  const [glitch, setGlitch] = useState(false)
  const [hackingText, setHackingText] = useState(hackingTexts[0])
  const [phase, setPhase] = useState<'glitch' | 'loading'>('glitch')
  const [initialGlitchIntensity, setInitialGlitchIntensity] = useState(1)

  // Initial strong glitch phase before loading starts
  useEffect(() => {
    // Strong glitch phase for 800ms
    const glitchTimer = setTimeout(() => {
      setPhase('loading')
    }, 800)

    // Animate glitch intensity down
    const intensityTimer = setInterval(() => {
      setInitialGlitchIntensity(prev => Math.max(0, prev - 0.15))
    }, 100)

    return () => {
      clearTimeout(glitchTimer)
      clearInterval(intensityTimer)
    }
  }, [])

  useEffect(() => {
    if (phase !== 'loading') return

    const glitchInterval = setInterval(() => {
      if (Math.random() > LOADER_GLITCH_PROBABILITY) {
        setGlitch(true)
        setTimeout(() => setGlitch(false), LOADER_GLITCH_DURATION_MS)
      }
    }, LOADER_GLITCH_INTERVAL_MS)

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * LOADER_PROGRESS_INCREMENT_MULTIPLIER
        const progressIndex = Math.floor((newProgress / 100) * hackingTexts.length)
        if (progressIndex < hackingTexts.length) {
          setHackingText(hackingTexts[progressIndex])
        }
        
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(onLoadComplete, LOADER_COMPLETE_DELAY_MS)
          return 100
        }
        return Math.min(newProgress, 100)
      })
    }, LOADER_PROGRESS_INTERVAL_MS)

    return () => {
      clearInterval(interval)
      clearInterval(glitchInterval)
    }
  }, [onLoadComplete, phase])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Intense initial glitch overlay */}
      <AnimatePresence>
        {phase === 'glitch' && (
          <motion.div
            className="absolute inset-0 z-30"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Full-screen glitch bars */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={`bar-${i}`}
                className="absolute w-full bg-primary"
                style={{
                  height: `${Math.random() * 8 + 2}px`,
                  top: `${Math.random() * 100}%`,
                  opacity: initialGlitchIntensity * (Math.random() * 0.8 + 0.2),
                  mixBlendMode: 'screen',
                }}
                animate={{
                  x: [0, Math.random() * 100 - 50, 0, Math.random() * -80, 0],
                  scaleX: [1, 1.5, 0.5, 2, 1],
                }}
                transition={{ duration: 0.4, repeat: 2, ease: 'linear' }}
              />
            ))}
            {/* Chromatic aberration flash */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(90deg, oklch(0.50 0.22 25 / ${initialGlitchIntensity * 0.3}) 0%, transparent 30%, transparent 70%, oklch(0.50 0.22 210 / ${initialGlitchIntensity * 0.2}) 100%)`,
                mixBlendMode: 'screen',
              }}
              animate={{ opacity: [1, 0.5, 1, 0.3, 0] }}
              transition={{ duration: 0.8 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced code rain background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="text-primary font-mono text-[10px] leading-tight">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="whitespace-nowrap"
              animate={{ opacity: [0.05, 0.4, 0.05] }}
              transition={{ duration: Math.random() * 3 + 1, repeat: Infinity, delay: Math.random() * 2 }}
              style={{ 
                transform: `translateX(${Math.random() * 20 - 10}px)`,
              }}
            >
              {codeFragments[i % codeFragments.length]}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scanline overlay on loader */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <div className="absolute inset-0 hud-scanline opacity-40" />
      </div>

      {/* Floating hex addresses */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`hex-${i}`}
            className="absolute text-primary/10 font-mono text-[9px]"
            style={{
              left: `${Math.random() * 90}%`,
              top: `${Math.random() * 90}%`,
            }}
            animate={{ 
              opacity: [0, 0.2, 0],
              y: [0, -30],
            }}
            transition={{ 
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          >
            0x{Math.random().toString(16).slice(2, 10).toUpperCase().padEnd(8, '0')}
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-8 relative z-10">
        <motion.img
          src={logoImage}
          alt="NEUROKLAST"
          className={`w-40 h-40 object-contain ${glitch ? 'red-glitch-element' : ''}`}
          style={{ 
            filter: `drop-shadow(0 0 20px oklch(0.50 0.22 25 / 0.4)) drop-shadow(0 0 40px oklch(0.50 0.22 25 / 0.15))`,
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: [0.7, 1, 0.7],
            scale: phase === 'glitch' ? [0.8, 1.05, 0.95, 1] : 1,
          }}
          transition={{
            opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 0.8 },
          }}
        />
        
        <div className="relative w-80 h-2 bg-secondary/30 overflow-hidden border border-primary/20">
          <motion.div
            className="absolute inset-0 bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
          {/* Glow effect on progress bar */}
          <motion.div
            className="absolute inset-0 bg-primary/30 blur-sm"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        
        <div className="flex flex-col gap-3 items-center">
          <motion.div
            className={`text-primary font-mono text-base tracking-[0.08em] ${glitch ? 'red-glitch-text' : ''}`}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {Math.floor(progress)}%
          </motion.div>
          
          <motion.div
            className="text-primary/50 font-mono text-xs max-w-md text-center h-6"
            key={hackingText}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {hackingText}
          </motion.div>

          {/* Extra code fragment line */}
          <motion.div
            className="text-primary/20 font-mono text-[9px] tracking-wider"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {codeFragments[Math.floor(progress / 100 * codeFragments.length) % codeFragments.length]}
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <motion.div
          className="text-muted-foreground/30 font-mono text-[10px] tracking-[0.08em]"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          NK-SYS [v2.0] // BOOT SEQUENCE
        </motion.div>
      </div>
    </motion.div>
  )
}
