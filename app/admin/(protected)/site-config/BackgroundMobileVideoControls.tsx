'use client'

import { VideoSourcePicker } from '@/app/admin/_components/VideoSourcePicker'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import type { MobileVideoMode } from '@/lib/background-config'

interface BackgroundMobileVideoControlsProps {
  mobileVideoMode: MobileVideoMode
  mobileVideoUrl: string
  mobileVideoStoragePath: string
  onModeChange: (mode: MobileVideoMode) => void
  onResolved: (path: string, publicUrl?: string) => void
  onCleared: () => void
  onError: (message: string) => void
}

/** Controlled mobile video selection; the original conditional upload stays intact. */
export function BackgroundMobileVideoControls({
  mobileVideoMode,
  mobileVideoUrl,
  mobileVideoStoragePath,
  onModeChange,
  onResolved,
  onCleared,
  onError,
}: BackgroundMobileVideoControlsProps) {
  return (
      <div className="space-y-3 pt-2 border-t border-zinc-800">
        <div>
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-widest">Mobile video</p>
          <p className="text-xs text-zinc-500 mt-1">
            Phones and small tablets. Separate video saves bandwidth; &quot;No video&quot; skips video
            and uses the background image as fallback (desktop video can stay on).
          </p>
        </div>
        <RadioGroupPrimitive.Root
          value={mobileVideoMode}
          onValueChange={(v) => onModeChange(v as MobileVideoMode)}
          className="space-y-2"
        >
          {(
            [
              { value: 'same', label: 'Same as desktop' },
              { value: 'separate', label: 'Different video' },
              { value: 'off', label: 'No video on mobile (use image)' },
            ] as const
          ).map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <RadioGroupPrimitive.Item
                value={value}
                className="size-4 rounded-full border border-zinc-600 data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500/20 focus:outline-none"
              >
                <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                  <span className="block size-2 rounded-full bg-red-500" />
                </RadioGroupPrimitive.Indicator>
              </RadioGroupPrimitive.Item>
              <span className="text-xs text-zinc-300">{label}</span>
            </label>
          ))}
        </RadioGroupPrimitive.Root>

        {mobileVideoMode === 'separate' && (
          <VideoSourcePicker
            label="Mobile video"
            currentUrl={mobileVideoUrl || null}
            currentStoragePath={mobileVideoStoragePath || null}
            storagePrefix="background/videos/mobile"
            scrubVariant="mobile"
            onResolved={onResolved}
            onCleared={onCleared}
            onError={onError}
          />
        )}
      </div>
  )
}
