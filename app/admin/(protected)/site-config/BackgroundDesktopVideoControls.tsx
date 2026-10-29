'use client'

import { VideoSourcePicker } from '@/app/admin/_components/VideoSourcePicker'
import { BackgroundOpacitySlider } from './BackgroundOpacitySlider'

interface BackgroundDesktopVideoControlsProps {
  backgroundVideoEnabled: boolean
  videoUrl: string
  videoStoragePath: string
  backgroundVideoOpacity: number
  onToggleEnabled: () => void
  onResolved: (path: string, publicUrl?: string) => void
  onCleared: () => void
  onOpacityChange: (value: number) => void
  onError: (message: string) => void
}

/** Controlled desktop video presentation; persisted settings stay in the parent. */
export function BackgroundDesktopVideoControls({
  backgroundVideoEnabled,
  videoUrl,
  videoStoragePath,
  backgroundVideoOpacity,
  onToggleEnabled,
  onResolved,
  onCleared,
  onOpacityChange,
  onError,
}: BackgroundDesktopVideoControlsProps) {
  return (
      <div className="space-y-4 pt-2 border-t border-zinc-800">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-zinc-400 font-semibold uppercase tracking-widest">Desktop video</p>
            <p className="text-xs text-zinc-500 mt-1">
              Upload MP4, MOV or WebM. Videos are automatically converted to fast-seeking MP4 for scroll scrubbing.
              Use the switch to turn video off without deleting the file.
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleEnabled}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              backgroundVideoEnabled ? 'bg-red-600' : 'bg-zinc-700'
            }`}
            role="switch"
            aria-checked={backgroundVideoEnabled}
            aria-label="Enable background video"
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
                backgroundVideoEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <p className="text-xs font-mono text-zinc-400">
          Background video: {backgroundVideoEnabled ? 'ON' : 'OFF'}
        </p>

        <VideoSourcePicker
          label="Desktop video (optional)"
          currentUrl={videoUrl || null}
          currentStoragePath={videoStoragePath || null}
          storagePrefix="background/videos"
          scrubVariant="desktop"
          onResolved={onResolved}
          onCleared={onCleared}
          onError={onError}
        />

        {backgroundVideoEnabled ? (
          <BackgroundOpacitySlider
            label="Video opacity"
            value={backgroundVideoOpacity}
            onChange={onOpacityChange}
          />
        ) : (
          <p className="text-xs text-zinc-500">
            Video is off. Opacity is ignored until you turn video back on.
          </p>
        )}
      </div>
  )
}
