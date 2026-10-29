'use client'

import * as SliderPrimitive from '@radix-ui/react-slider'

export function BackgroundOpacitySlider({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-2">
      <label className="block text-xs text-zinc-400">
        {label}: <span className="font-mono text-zinc-300">{Math.round(value * 100)}%</span>
      </label>
      <SliderPrimitive.Root
        min={0}
        max={1}
        step={0.05}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="relative flex items-center w-full touch-none select-none h-5"
        aria-label={label}
      >
        <SliderPrimitive.Track className="relative h-1 grow rounded-full bg-zinc-700">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-red-500" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block size-4 rounded-full border border-red-500 bg-zinc-900 shadow focus:outline-none cursor-grab" />
      </SliderPrimitive.Root>
    </div>
  )
}
