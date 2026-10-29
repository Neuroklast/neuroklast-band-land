'use client'

import * as SliderPrimitive from '@radix-ui/react-slider'
import type { HeroPowerGlitchConfig, HeroPowerGlitchMode } from '@/lib/hero-glitch-config'

export interface HeroGlitchControlsProps extends HeroPowerGlitchConfig {
  onModeChange: (value: HeroPowerGlitchMode) => void
  onDurationMsChange: (value: number) => void
  onSliceCountChange: (value: number) => void
  onShakeChange: (value: boolean) => void
  onHueRotateChange: (value: boolean) => void
  onPulseChange: (value: boolean) => void
  onContinuousChange: (value: boolean) => void
}

/** Controlled wordmark PowerGlitch controls; draft, preview and save remain in the parent. */
export function HeroGlitchControls({
  mode,
  durationMs,
  sliceCount,
  shake,
  hueRotate,
  pulse,
  continuous,
  onModeChange,
  onDurationMsChange,
  onSliceCountChange,
  onShakeChange,
  onHueRotateChange,
  onPulseChange,
  onContinuousChange,
}: HeroGlitchControlsProps) {
  return (
        <div className="space-y-3 border-t border-zinc-800 pt-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Wordmark glitch</p>
            <p className="mt-1 text-xs text-zinc-500">
              PowerGlitch on the hero image. Off keeps the CRT idle burst. Hover glitches on mouseover; always loops.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {([
              ['off', 'Off'],
              ['hover', 'Hover'],
              ['always', 'Always'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => onModeChange(value)}
                className={`min-h-[44px] rounded border px-3 text-sm ${
                  mode === value
                    ? 'border-red-700/50 bg-red-900/40 text-white'
                    : 'border-zinc-700 text-zinc-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {mode !== 'off' ? (
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Duration — {durationMs}ms
              </label>
              <SliderPrimitive.Root
                aria-label="Glitch duration"
                min={120}
                max={8000}
                step={50}
                value={[durationMs]}
                onValueChange={([value]) => onDurationMsChange(value)}
                className="relative flex h-5 w-full touch-none select-none items-center"
              >
                <SliderPrimitive.Track className="relative h-1 grow rounded-full bg-zinc-700">
                  <SliderPrimitive.Range className="absolute h-full rounded-full bg-red-500" />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb className="block size-4 cursor-grab rounded-full border border-red-500 bg-zinc-900 shadow focus:outline-none" />
              </SliderPrimitive.Root>
              <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Slices — {sliceCount}
              </label>
              <SliderPrimitive.Root
                aria-label="Glitch slice count"
                min={2}
                max={16}
                step={1}
                value={[sliceCount]}
                onValueChange={([value]) => onSliceCountChange(value)}
                className="relative flex h-5 w-full touch-none select-none items-center"
              >
                <SliderPrimitive.Track className="relative h-1 grow rounded-full bg-zinc-700">
                  <SliderPrimitive.Range className="absolute h-full rounded-full bg-red-500" />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb className="block size-4 cursor-grab rounded-full border border-red-500 bg-zinc-900 shadow focus:outline-none" />
              </SliderPrimitive.Root>
              <div className="flex flex-wrap gap-4 text-xs text-zinc-300">
                <label className="flex min-h-[44px] items-center gap-2">
                  <input type="checkbox" checked={shake} onChange={(e) => onShakeChange(e.target.checked)} />
                  Shake
                </label>
                <label className="flex min-h-[44px] items-center gap-2">
                  <input type="checkbox" checked={hueRotate} onChange={(e) => onHueRotateChange(e.target.checked)} />
                  Hue rotate
                </label>
                <label className="flex min-h-[44px] items-center gap-2">
                  <input type="checkbox" checked={pulse} onChange={(e) => onPulseChange(e.target.checked)} />
                  Pulse
                </label>
                <label className="flex min-h-[44px] items-center gap-2">
                  <input type="checkbox" checked={continuous} onChange={(e) => onContinuousChange(e.target.checked)} />
                  Continuous
                </label>
              </div>
            </div>
          ) : null}
        </div>
  )
}
