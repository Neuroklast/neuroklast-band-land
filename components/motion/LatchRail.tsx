'use client'

import { HudReadout } from '@/components/motion/HudReadout'
import { ProgressMeter } from '@/components/motion/ProgressMeter'
import { ServoPair } from '@/components/motion/ServoPair'
import { useLatchSlider } from '@/hooks/use-latch-slider'
import { buildSliderTelemetry } from '@/lib/terminal-auth-telemetry'
import { useEffect, useState } from 'react'

export function LatchRail({
  reducedMotion,
  granted,
  onGranted,
  ariaLabel,
  label,
  grantedLabel,
  compact = false,
}: {
  reducedMotion: boolean
  granted: boolean
  onGranted: () => void
  ariaLabel: string
  label: string
  grantedLabel?: string
  compact?: boolean
}) {
  const { state, trackRef, dragging, onKeyDown, onKeyUp, onClick, onPointerDownTrack, onPointerDownHandle, pct } =
    useLatchSlider({ granted, onGranted, reducedMotion, pad: compact ? 18 : 28 })
  const [nowMs, setNowMs] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(performance.now()), 90)
    return () => window.clearInterval(id)
  }, [])

  const telemetry = buildSliderTelemetry(state.progress, state.latch, nowMs)
  const handleSize = compact ? 'h-10 w-10' : 'h-14 w-14'
  const trackHeight = compact ? 'h-12' : 'h-16'
  const inset = compact ? 18 : 28

  return (
    <div className={`flex w-full ${compact ? 'max-w-xl' : 'max-w-3xl'} flex-col items-center ${compact ? 'gap-3' : 'gap-6'}`}>
      {!compact ? (
        <HudReadout
          items={[
            { label: 'TORQUE', value: telemetry.torque.toFixed(1), hot: true },
            { label: 'VECTOR', value: telemetry.vector.toFixed(3) },
            { label: 'LATCH', value: telemetry.latch, hot: telemetry.latch === 'SEALED' },
            { label: 'CRC', value: telemetry.crc },
          ]}
        />
      ) : null}

      <ServoPair progress={state.progress} heightClass={trackHeight}>
        <div className="mb-1 flex justify-between font-mono text-[8px] uppercase tracking-widest text-primary/35">
          <span>SERVO L</span>
          <span>{compact ? 'NK.JACK.RAIL' : 'NK.LATCH.RAIL'}</span>
          <span>SERVO R</span>
        </div>
        <div
          ref={trackRef}
          className={`relative ${trackHeight} cursor-ew-resize border border-primary/40 bg-black/50`}
          onPointerDown={onPointerDownTrack}
        >
          <div className="absolute inset-x-2 top-1/2 flex -translate-y-1/2 justify-between" aria-hidden>
            {Array.from({ length: compact ? 7 : 11 }, (_, index) => (
              <span
                key={index}
                className="h-2 w-px bg-primary"
                style={{ opacity: state.progress * (compact ? 6 : 10) >= index ? 0.9 : 0.2 }}
              />
            ))}
          </div>
          <div
            className="absolute inset-y-1 left-1 bg-primary/25"
            style={{ width: pct <= 0 ? 0 : `calc(${pct}% - 4px)` }}
            aria-hidden
          />
          <div className="absolute inset-y-0" style={{ left: inset, right: inset }}>
            <div
              className="absolute top-1/2 left-0 w-full"
              style={{ transform: `translate3d(${state.progress * 100}%, -50%, 0)` }}
            >
              <div
                role="slider"
                tabIndex={0}
                aria-label={ariaLabel}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
                aria-valuetext={`${pct}%`}
                className={`absolute top-1/2 left-0 z-10 flex ${handleSize} -translate-x-1/2 -translate-y-1/2 cursor-ew-resize touch-none items-center justify-center border border-primary bg-black outline-none focus-visible:border-primary`}
                style={{
                  touchAction: 'none',
                  boxShadow:
                    dragging || granted
                      ? '0 0 16px color-mix(in srgb, var(--primary) 55%, transparent)'
                      : undefined,
                }}
                onPointerDown={onPointerDownHandle}
                onKeyDown={onKeyDown}
                onKeyUp={onKeyUp}
                onClick={onClick}
              >
                <span className="absolute inset-1 border border-primary/40" aria-hidden />
                <span className="h-3 w-px bg-primary" aria-hidden />
                <span className="absolute h-px w-3 bg-primary" aria-hidden />
              </div>
            </div>
          </div>
        </div>
      </ServoPair>

      <ProgressMeter progress={state.progress} className="w-full" />
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary" aria-live="polite">
        {granted || state.latch === 'sealed' ? (grantedLabel ?? label) : label}
      </p>
    </div>
  )
}
