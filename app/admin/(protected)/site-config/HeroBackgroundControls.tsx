'use client'

import { MediaSourcePicker } from '@/app/admin/_components/MediaSourcePicker'
import * as SliderPrimitive from '@radix-ui/react-slider'

export interface HeroBackgroundControlsProps {
  backgroundImageUrl: string
  backgroundImageStoragePath: string
  backgroundImageOpacity: number
  onBackgroundResolved: (path: string, publicUrl?: string) => void
  onBackgroundCleared: () => void
  onOpacityChange: (value: number) => void
  onError: (message: string) => void
}

/** Hero-only background overlay UI; no storage or save side effects. */
export function HeroBackgroundControls({
  backgroundImageUrl,
  backgroundImageStoragePath,
  backgroundImageOpacity,
  onBackgroundResolved,
  onBackgroundCleared,
  onOpacityChange,
  onError,
}: HeroBackgroundControlsProps) {
  return (
    <>
        <MediaSourcePicker
          label="Hero Background Overlay (optional)"
          currentUrl={backgroundImageUrl || null}
          currentStoragePath={backgroundImageStoragePath || null}
          storagePrefix="hero/background"
          editorAspectRatio={16 / 9}
          editorFitMode="cover"
          onResolved={onBackgroundResolved}
          onCleared={onBackgroundCleared}
          onError={onError}
        />
        <p className="text-xs text-zinc-500">
          Full-bleed image behind the wordmark only — not the logo itself. Leave empty to use the global site background.
        </p>

        <div className="space-y-2">
          <label className="block text-xs text-zinc-400 font-semibold uppercase tracking-widest">
            Background Overlay Opacity:{' '}
            <span className="text-zinc-300 font-mono">{backgroundImageOpacity.toFixed(2)}</span>
          </label>
          <SliderPrimitive.Root
            min={0}
            max={1}
            step={0.05}
            value={[backgroundImageOpacity]}
            onValueChange={([v]) => onOpacityChange(v)}
            className="relative flex items-center w-full touch-none select-none h-5"
          >
            <SliderPrimitive.Track className="relative h-1 grow rounded-full bg-zinc-700">
              <SliderPrimitive.Range className="absolute h-full rounded-full bg-red-500" />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb className="block size-4 rounded-full border border-red-500 bg-zinc-900 shadow focus:outline-none cursor-grab" />
          </SliderPrimitive.Root>
        </div>
    </>
  )
}
