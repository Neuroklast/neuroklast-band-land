'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import type { LoadingScreenSlotProps } from '@/lib/types'
import { parseLoadingScreenConfig } from '@/lib/loading-screen-config'

const codeRainParams = Array.from({ length: 20 }, (_, i) => ({
  duration: 3 + (i % 5) * 0.6,
  delay: i * 0.15,
  translateX: -200 + i * 50,
}))

export default function NeuroklastClassicLoadingScreen({ onComplete, config }: LoadingScreenSlotProps) {
  const settings = parseLoadingScreenConfig(config)
  const prefersReducedMotion = useReducedMotion()
  const [progress, setProgress] = useState(0)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  useEffect(() => {
    const stepMs = Math.max(20, Math.round(settings.durationMs / 50))
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); return 100 }
        return Math.min(prev + 2, 100)
      })
    }, stepMs)
    return () => clearInterval(interval)
  }, [settings.durationMs])

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => onCompleteRef.current(), 500)
      return () => clearTimeout(t)
    }
  }, [progress])

  const hackingText = settings.hackingTexts[Math.min(
    Math.floor(progress / 100 * settings.hackingTexts.length),
    settings.hackingTexts.length - 1,
  )]
  const codeFragment = settings.codeFragments[Math.floor(progress / 100 * settings.codeFragments.length) % settings.codeFragments.length]

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-background overflow-hidden"
      style={{ zIndex: 'var(--z-system)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* ASCII code fragments fading in background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="text-primary font-mono text-[10px] leading-tight">
          {codeRainParams.map((params, i) => (
            <motion.div
              key={i}
              className="whitespace-nowrap"
              animate={prefersReducedMotion ? { opacity: 0.15 } : { opacity: [0.05, 0.4, 0.05] }}
              transition={{ duration: params.duration, repeat: prefersReducedMotion ? 0 : Infinity, delay: prefersReducedMotion ? 0 : params.delay }}
              style={{ transform: `translateX(${params.translateX}px)` }}
            >
              {settings.codeFragments[i % settings.codeFragments.length]}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-8 relative z-10">
        {/* Logo with pulsing crimson glow */}
        {/*
          ALPHA-KANAL-GLOW: filter: drop-shadow() MUSS auf dem Wrapper-<div> sitzen,
          nicht auf dem <img> selbst. Nur so folgt der Glow der transparenten
          Silhouette des Bildes. Der Wrapper darf außerdem KEIN overflow:hidden haben.
        */}
        <motion.div
          style={{
            filter: 'drop-shadow(0 0 20px oklch(0.50 0.22 25 / 0.4)) drop-shadow(0 0 40px oklch(0.50 0.22 25 / 0.15))',
          }}
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.5 }}
          animate={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: [0.7, 1, 0.7], scale: 1 }}
          transition={{
            opacity: { duration: 2, repeat: prefersReducedMotion ? 0 : Infinity, ease: 'easeInOut' },
            scale: { duration: prefersReducedMotion ? 0 : 0.8 },
          }}
        >
          <img
            src={settings.logoUrl}
            alt={settings.bootLabel || 'Neuroklast'}
            className="object-contain"
            style={{ width: settings.logoSizePx, height: settings.logoSizePx }}
          />
        </motion.div>

        {/* Progress bar */}
        <div className="relative h-2 w-[min(20rem,calc(100vw-2rem))] bg-secondary/30 overflow-hidden border border-primary/20">
          <motion.div
            className="absolute inset-0 bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
          <motion.div
            className="absolute inset-0 bg-primary/30 blur-sm"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <div className="flex flex-col gap-3 items-center">
          <motion.div
            className="text-primary font-mono text-base tracking-[0.08em]"
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: prefersReducedMotion ? 0 : Infinity }}
          >
            {Math.floor(progress)}%
          </motion.div>

          <motion.div
            className="text-primary/50 font-mono text-xs max-w-md text-center h-6"
            key={hackingText}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {hackingText}
          </motion.div>

          <motion.div
            className="text-primary/50 font-mono text-xs tracking-wider"
            animate={prefersReducedMotion ? { opacity: 0.4 } : { opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 2, repeat: prefersReducedMotion ? 0 : Infinity }}
          >
            {codeFragment}
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <motion.div
          className="text-muted-foreground font-mono text-xs tracking-[0.08em]"
          animate={prefersReducedMotion ? { opacity: 0.7 } : { opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: prefersReducedMotion ? 0 : Infinity }}
        >
          {settings.bootLabel}
        </motion.div>
      </div>
    </motion.div>
  )
}
NeuroklastClassicLoadingScreen.displayName = 'NeuroklastClassicLoadingScreen'
