'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ProgressMeter } from '@/components/motion/ProgressMeter'
import { applyHoldProgress } from '@/lib/terminal-auth-physics'
import { buildFingerprintTelemetry } from '@/lib/terminal-auth-telemetry'
import { useLocale } from '@/contexts/LocaleContext'

const RIDGES = [
  'M44 22c12-8 28-6 36 6 6 9 6 20 2 30',
  'M40 26c14-11 34-9 42 8 7 12 6 24 0 34',
  'M37 31c16-13 38-10 45 10 6 14 4 26-4 36',
  'M35 37c17-14 40-10 46 12 5 16 2 28-8 37',
  'M34 44c16-12 38-8 44 14 4 14-1 27-12 35',
  'M36 50c14-10 32-6 38 12 3 12-3 24-14 30',
  'M40 55c11-8 26-4 31 10 2 10-4 20-13 24',
  'M76 24c8 10 8 24 1 36-4 8-12 14-22 16',
  'M80 30c8 12 6 26-2 37-6 9-16 14-26 14',
  'M83 38c6 12 3 24-6 34-7 8-18 12-28 10',
  'M28 48c-4 12 0 26 10 34 8 6 20 8 30 4',
  'M30 56c-2 10 3 22 12 28 8 5 20 5 28 0',
  'M48 64c8-4 16-2 20 6 3 6 1 14-6 18',
  'M52 70c6-2 12 1 14 7 1 5-2 10-8 12',
]

const MINUTIAE = [
  [58, 34], [70, 42], [76, 54], [72, 68], [60, 78], [46, 74],
  [38, 62], [36, 48], [44, 36], [62, 50], [54, 58], [66, 60],
  [50, 44], [80, 46], [42, 70], [56, 82], [68, 32], [32, 54],
  [74, 72], [48, 28], [84, 58], [40, 40], [64, 76], [52, 52],
] as const

const RING = 2 * Math.PI * 52

function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    // some browsers throw when vibrate is blocked
  }
}

export function TerminalFingerprintAuth({
  reducedMotion,
  granted,
  onGranted,
  onDrop,
}: {
  reducedMotion: boolean
  granted: boolean
  onGranted: () => void
  onDrop: () => void
}) {
  const { t } = useLocale()
  const [progress, setProgress] = useState(0)
  const [holding, setHolding] = useState(false)
  const [nowMs, setNowMs] = useState(0)
  const holdingRef = useRef(false)
  const progressRef = useRef(0)
  const grantedRef = useRef(granted)

  useEffect(() => {
    grantedRef.current = granted
  }, [granted])

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(performance.now()), 80)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (granted) return
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(32, now - last)
      last = now
      const next = applyHoldProgress(progressRef.current, dt, holdingRef.current)
      progressRef.current = next
      setProgress(next)
      if (next >= 1) {
        grantedRef.current = true
        holdingRef.current = false
        setHolding(false)
        onGranted()
        return
      }
      if (!holdingRef.current && next <= 0) return
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [granted, holding, onGranted])

  const startHold = useCallback(() => {
    if (grantedRef.current) return
    if (reducedMotion) {
      grantedRef.current = true
      progressRef.current = 1
      setProgress(1)
      onGranted()
      return
    }
    holdingRef.current = true
    setHolding(true)
    vibrate(12)
  }, [onGranted, reducedMotion])

  const endHold = useCallback(() => {
    if (grantedRef.current || reducedMotion) return
    if (holdingRef.current && progressRef.current > 0.04 && progressRef.current < 1) {
      onDrop()
    }
    holdingRef.current = false
    setHolding(false)
  }, [onDrop, reducedMotion])

  const telemetry = buildFingerprintTelemetry(progress, nowMs)
  const status = granted
    ? t('secretTerminal.authGranted')
    : holding
      ? t('secretTerminal.authHold')
      : progress > 0
        ? t('secretTerminal.authDrop')
        : t('secretTerminal.authHold')

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6 md:flex-row md:items-stretch md:justify-center md:gap-10">
      <ul className="hidden w-40 shrink-0 flex-col justify-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-primary/55 md:flex">
        <li className="flex justify-between gap-3">
          <span className="text-primary/35">MINUTIAE</span>
          <span className="tabular-nums text-primary">{String(telemetry.minutiae).padStart(2, '0')}/24</span>
        </li>
        <li className="flex justify-between gap-3">
          <span className="text-primary/35">RIDGE Δ</span>
          <span className="tabular-nums">{telemetry.ridgeDelta.toFixed(2)}</span>
        </li>
        <li className="flex justify-between gap-3">
          <span className="text-primary/35">LIVENESS</span>
          <span className={telemetry.liveness === 'OK' ? 'text-primary' : 'text-primary/45'}>{telemetry.liveness}</span>
        </li>
        <li className="flex justify-between gap-3">
          <span className="text-primary/35">CAP-ARRAY</span>
          <span>{telemetry.capArray}</span>
        </li>
        <li className="mt-2 break-all text-[8px] tracking-normal text-primary/35">{telemetry.hexDump}</li>
      </ul>

      <div className="flex flex-col items-center gap-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-primary/50">
          {t('secretTerminal.authPlaten')}
        </p>
        <div className="relative rounded-sm border border-primary/30 bg-black/30 px-3 pb-3 pt-6">
          <span className="pointer-events-none absolute top-1 left-1 font-mono text-[8px] tracking-widest text-primary/35">
            SCANNER
          </span>
          <span className="pointer-events-none absolute top-1 right-1 font-mono text-[8px] tracking-widest text-primary/35">
            CAP-ARR
          </span>
        <motion.button
          type="button"
          className="relative size-[min(72vw,15.5rem)] touch-none rounded-full border border-primary/35 bg-black/40 outline-none focus-visible:border-primary"
          style={{ touchAction: 'none' }}
          aria-label={t('secretTerminal.authHoldAria')}
          aria-pressed={holding}
          onPointerDown={(event) => {
            event.preventDefault()
            startHold()
          }}
          onPointerUp={endHold}
          onPointerCancel={endHold}
          onPointerLeave={endHold}
          onClick={() => {
            if (reducedMotion) startHold()
          }}
          animate={
            granted
              ? { filter: ['brightness(1)', 'brightness(2.2)', 'brightness(1.15)'] }
              : holding
                ? { scale: 1.03 }
                : { scale: 1 }
          }
          transition={{ duration: granted ? 0.28 : 0.18, ease: 'easeOut' }}
        >
          <span
            className="pointer-events-none absolute inset-3 rounded-full"
            style={{
              boxShadow: holding || granted
                ? '0 0 28px color-mix(in srgb, var(--primary) 45%, transparent), inset 0 0 24px color-mix(in srgb, var(--primary) 22%, transparent)'
                : 'inset 0 0 18px color-mix(in srgb, var(--primary) 10%, transparent)',
            }}
            aria-hidden
          />
          <svg viewBox="0 0 120 120" className="relative size-full text-primary" aria-hidden>
            {Array.from({ length: 24 }, (_, index) => (
              <line
                key={`tick-${index}`}
                x1="60"
                y1="6"
                x2="60"
                y2="11"
                stroke="currentColor"
                strokeWidth="0.7"
                transform={`rotate(${index * 15} 60 60)`}
                opacity={index === Math.floor(progress * 24) % 24 ? 0.95 : 0.22}
              />
            ))}
            <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeDasharray={RING}
              strokeDashoffset={RING * (1 - progress)}
              strokeLinecap="square"
              transform="rotate(-90 60 60)"
              opacity="0.95"
            />
            <rect x="18" y="18" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.45" />
            <rect x="92" y="18" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.45" />
            <rect x="18" y="92" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.45" />
            <rect x="92" y="92" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.45" />
            {RIDGES.map((d, index) => {
              const lit = progress >= (index + 1) / RIDGES.length
              return (
                <path
                  key={d}
                  d={d}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.15"
                  strokeLinecap="round"
                  opacity={lit ? 0.18 + progress * 0.82 : 0.16}
                />
              )
            })}
            {MINUTIAE.map(([x, y], index) => (
              <circle
                key={`${x}-${y}`}
                cx={x}
                cy={y}
                r="0.9"
                fill="currentColor"
                opacity={index < telemetry.minutiae ? 0.95 : 0.15}
              />
            ))}
          </svg>
          <motion.span
            className="pointer-events-none absolute inset-x-8 h-px bg-primary"
            animate={
              holding && !granted
                ? { top: ['18%', '82%'], opacity: [0.2, 1, 0.2] }
                : { top: '18%', opacity: 0 }
            }
            transition={
              holding && !granted
                ? { duration: 1.05, repeat: Infinity, ease: 'linear' }
                : { duration: 0.18 }
            }
            aria-hidden
          />
        </motion.button>
        </div>

        <ProgressMeter progress={progress} className="w-[min(72vw,15.5rem)]" />
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary" aria-live="polite">
          {status}
        </p>
      </div>

      <ul className="flex w-full max-w-xs flex-col gap-1 font-mono text-[9px] uppercase tracking-widest text-primary/55 md:hidden">
        <li>MINUTIAE {String(telemetry.minutiae).padStart(2, '0')}/24</li>
        <li>LIVENESS {telemetry.liveness}</li>
        <li className="text-[8px] tracking-normal text-primary/35">{telemetry.hexDump}</li>
      </ul>
    </div>
  )
}
