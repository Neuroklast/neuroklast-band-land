'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  applySliderRelease,
  applySliderToward,
  createSliderState,
  pointerToTrackProgress,
  tickSliderCoast,
  type SliderState,
} from '@/lib/terminal-auth-physics'
import { buildSliderTelemetry } from '@/lib/terminal-auth-telemetry'
import { useLocale } from '@/contexts/LocaleContext'

export function TerminalSliderAuth({
  reducedMotion,
  granted,
  onGranted,
}: {
  reducedMotion: boolean
  granted: boolean
  onGranted: () => void
}) {
  const { t } = useLocale()
  const trackRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<SliderState>(createSliderState)
  const stateRef = useRef(state)
  const lastXRef = useRef(0)
  const lastTRef = useRef(0)
  const grantedRef = useRef(granted)
  const draggingRef = useRef(false)
  const [nowMs, setNowMs] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [keyDriving, setKeyDriving] = useState(false)

  useEffect(() => {
    grantedRef.current = granted
  }, [granted])

  const commit = useCallback((next: SliderState) => {
    stateRef.current = next
    setState(next)
    if (next.latch === 'sealed' && !grantedRef.current) {
      onGranted()
    }
  }, [onGranted])

  const chasePointer = useCallback((clientX: number, dtMs: number) => {
    const track = trackRef.current?.getBoundingClientRect()
    const pad = 28
    const target = pointerToTrackProgress(
      clientX,
      (track?.left ?? 0) + pad,
      Math.max(1, (track?.width ?? 360) - pad * 2),
    )
    commit(applySliderToward(stateRef.current, target, dtMs))
  }, [commit])

  const beginDrag = useCallback((clientX: number, pointerId?: number, target?: HTMLElement) => {
    if (grantedRef.current) return
    draggingRef.current = true
    lastXRef.current = clientX
    lastTRef.current = performance.now()
    stateRef.current = { ...stateRef.current, dragging: true }
    setDragging(true)
    if (pointerId !== undefined && target?.setPointerCapture) {
      try {
        target.setPointerCapture(pointerId)
      } catch {
        // jsdom may not implement capture
      }
    }
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(performance.now()), 90)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (granted || (!dragging && !keyDriving && state.progress <= 0) || state.latch === 'sealed') return
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(32, now - last)
      last = now
      const current = stateRef.current
      if (grantedRef.current || current.latch === 'sealed') return
      if (keyDriving) {
        commit(applySliderToward(current, 1, dt))
        frame = window.requestAnimationFrame(tick)
        return
      }
      if (draggingRef.current) {
        chasePointer(lastXRef.current, dt)
        frame = window.requestAnimationFrame(tick)
        return
      }
      if (current.progress > 0) {
        const next = tickSliderCoast(current, dt)
        commit(next)
        if (next.progress > 0 && next.latch !== 'sealed') {
          frame = window.requestAnimationFrame(tick)
        }
      }
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [chasePointer, commit, dragging, granted, keyDriving, state.latch, state.progress])

  useEffect(() => {
    if (!dragging) return

    const onMove = (event: PointerEvent) => {
      if (!draggingRef.current) return
      const now = performance.now()
      const dt = Math.max(1, now - lastTRef.current)
      lastXRef.current = event.clientX
      lastTRef.current = now
      chasePointer(event.clientX, dt)
    }

    const onUp = () => {
      draggingRef.current = false
      setDragging(false)
      commit(applySliderRelease(stateRef.current))
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [chasePointer, commit, dragging])

  const telemetry = buildSliderTelemetry(state.progress, state.latch, nowMs)
  const pct = Math.round(state.progress * 100)
  const status = granted
    ? t('secretTerminal.authGranted')
    : state.latch === 'sealed'
      ? t('secretTerminal.authGranted')
      : t('secretTerminal.authSlide')

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6">
      <div className="grid w-full grid-cols-2 gap-x-8 gap-y-1 font-mono text-[9px] uppercase tracking-widest text-primary/55 sm:grid-cols-4">
        <span className="flex justify-between gap-2">
          <span className="text-primary/35">TORQUE</span>
          <span className="tabular-nums text-primary">{telemetry.torque.toFixed(1)}</span>
        </span>
        <span className="flex justify-between gap-2">
          <span className="text-primary/35">VECTOR</span>
          <span className="tabular-nums">{telemetry.vector.toFixed(3)}</span>
        </span>
        <span className="flex justify-between gap-2">
          <span className="text-primary/35">LATCH</span>
          <span className={telemetry.latch === 'SEALED' ? 'text-primary' : ''}>{telemetry.latch}</span>
        </span>
        <span className="flex justify-between gap-2">
          <span className="text-primary/35">CRC</span>
          <span className="tabular-nums">{telemetry.crc}</span>
        </span>
      </div>

      <div className="flex w-full items-end gap-3">
        <div className="flex h-16 w-2 flex-col justify-end overflow-hidden bg-primary/15" aria-hidden>
          <div className="w-full origin-bottom bg-primary" style={{ height: `${Math.min(100, pct * 1.1)}%` }} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex justify-between font-mono text-[8px] uppercase tracking-widest text-primary/35">
            <span>SERVO L</span>
            <span>NK.LATCH.RAIL</span>
            <span>SERVO R</span>
          </div>
          <div
            ref={trackRef}
            className="relative h-16 cursor-ew-resize border border-primary/40 bg-black/50"
            onPointerDown={(event) => {
              event.preventDefault()
              beginDrag(event.clientX, event.pointerId, event.currentTarget)
            }}
          >
            <div className="absolute inset-x-2 top-1/2 flex -translate-y-1/2 justify-between" aria-hidden>
              {Array.from({ length: 11 }, (_, index) => (
                <span
                  key={index}
                  className="h-2 w-px bg-primary"
                  style={{ opacity: state.progress * 10 >= index ? 0.9 : 0.2 }}
                />
              ))}
            </div>
            <div
              className="absolute inset-y-1 left-1 bg-primary/25"
              style={{ width: `calc(${pct}% - 4px)` }}
              aria-hidden
            />
            <motion.div
              role="slider"
              tabIndex={0}
              aria-label={t('secretTerminal.authSlideAria')}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              aria-valuetext={`${pct}%`}
              className="absolute top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize touch-none items-center justify-center border border-primary bg-black outline-none focus-visible:border-primary"
              style={{
                left: `calc(28px + (100% - 56px) * ${state.progress})`,
                touchAction: 'none',
                boxShadow: dragging || granted
                  ? '0 0 16px color-mix(in srgb, var(--primary) 55%, transparent)'
                  : undefined,
              }}
              onPointerDown={(event) => {
                event.stopPropagation()
                event.preventDefault()
                beginDrag(event.clientX, event.pointerId, event.currentTarget)
              }}
              onKeyDown={(event) => {
                if (grantedRef.current) return
                if (event.key === 'ArrowRight' || event.key === ' ') {
                  event.preventDefault()
                  if (reducedMotion) {
                    onGranted()
                    return
                  }
                  setKeyDriving(true)
                }
              }}
              onKeyUp={(event) => {
                if (event.key === 'ArrowRight' || event.key === ' ') {
                  setKeyDriving(false)
                  commit(applySliderRelease(stateRef.current))
                }
              }}
              onClick={() => {
                if (reducedMotion && !grantedRef.current) onGranted()
              }}
            >
              <span className="absolute inset-1 border border-primary/40" aria-hidden />
              <span className="h-3 w-px bg-primary" aria-hidden />
              <span className="absolute w-3 h-px bg-primary" aria-hidden />
            </motion.div>
          </div>
        </div>

        <div className="flex h-16 w-2 flex-col justify-end overflow-hidden bg-primary/15" aria-hidden>
          <div className="w-full origin-bottom bg-primary" style={{ height: `${Math.min(100, pct * 0.92)}%` }} />
        </div>
      </div>

      <div className="flex w-full items-center gap-2">
        <div className="h-0.5 flex-1 overflow-hidden bg-primary/20">
          <div className="h-full origin-left bg-primary" style={{ transform: `scaleX(${state.progress})` }} />
        </div>
        <span className="font-mono text-[9px] tabular-nums tracking-widest text-primary/60">{pct}%</span>
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary" aria-live="polite">
        {status}
      </p>
    </div>
  )
}
