'use client'

import { type Dispatch, type SetStateAction } from 'react'
import { AdminAccordion } from '@/app/admin/_components/AdminAccordion'
import {
  BUILTIN_APPEARANCE_PRESETS,
  type AppearanceTheme,
  type SavedAppearancePreset,
} from '@/lib/appearance-presets'
import { LOOKS, type LookDefinition } from '@/lib/looks'
import { getAllOverlayAnimations } from '@/lib/overlay-animations'
import { AppearanceOpacitySlider } from './AppearanceOpacitySlider'

const PRESET_SWATCH_KEYS: Array<keyof AppearanceTheme> = [
  'primaryColor',
  'accentColor',
  'backgroundColor',
  'foregroundColor',
  'cardColor',
]

function PresetSwatch({ theme }: { theme: AppearanceTheme }) {
  const colors = PRESET_SWATCH_KEYS.map((key) => theme[key]).filter(
    (c): c is string => typeof c === 'string' && c.length > 0,
  )

  return (
    <span className="flex gap-1 mt-1.5" aria-hidden="true">
      {colors.map((color, index) => (
        <span
          key={`${color}-${index}`}
          className="size-3 rounded-sm border border-zinc-700"
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  )
}


export interface AppearanceQuickStartProps {
  lookId: string
  overlayAnimations: string[]
  setOverlayAnimations: Dispatch<SetStateAction<string[]>>
  onApplyLook: (look: LookDefinition) => void
  onApplyPreset: (preset: SavedAppearancePreset) => void
  savedPresets: SavedAppearancePreset[]
  presetName: string
  onPresetNameChange: (value: string) => void
  onSavePreset: () => void
  sectionPanelOpacity: number
  sectionGridOpacity: number
  cardSurfaceOpacity: number
  onSectionPanelOpacityChange: (value: number) => void
  onSectionGridOpacityChange: (value: number) => void
  onCardSurfaceOpacityChange: (value: number) => void
  onApplyReadableMode: () => void
}

/** Controlled look/preset/surface UI. Parent retains draft state and save behavior. */
export function AppearanceQuickStart({
  lookId, overlayAnimations, setOverlayAnimations,
  onApplyLook, onApplyPreset, savedPresets, presetName, onPresetNameChange,
  onSavePreset, sectionPanelOpacity, sectionGridOpacity, cardSurfaceOpacity,
  onSectionPanelOpacityChange, onSectionGridOpacityChange,
  onCardSurfaceOpacityChange, onApplyReadableMode,
}: AppearanceQuickStartProps) {
  return (
      <AdminAccordion
        title="Quick start"
        description="Presets and section backgrounds — most changes happen here"
        defaultOpen
      >
        <div className="space-y-3">
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-widest">Looks</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {LOOKS.map((look) => (
              <button
                key={look.id}
                type="button"
                onClick={() => onApplyLook(look)}
                className={`text-left px-3 py-2 rounded border bg-zinc-950/50 transition-colors ${
                  lookId === look.id ? 'border-red-600' : 'border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <span className="block text-xs text-zinc-200">{look.name}</span>
                <span className="block text-[10px] text-zinc-500 mt-0.5">{look.description}</span>
                <PresetSwatch theme={look.theme} />
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-widest">Overlay animations</p>
          <p className="text-xs text-zinc-500">Select one or more. Each overlay open picks at random from the pool.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {getAllOverlayAnimations().map((animation) => {
              const selected = overlayAnimations.includes(animation.name)
              return (
                <button
                  key={animation.name}
                  type="button"
                  onClick={() =>
                    setOverlayAnimations((current) =>
                      selected
                        ? current.filter((name) => name !== animation.name)
                        : [...current, animation.name],
                    )
                  }
                  className={`text-left px-3 py-2 rounded border bg-zinc-950/50 transition-colors ${
                    selected ? 'border-red-600' : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <span className="block text-xs text-zinc-200">{animation.loaderLabel}</span>
                  <span className="block text-[10px] text-zinc-500 mt-0.5">{animation.name}</span>
                </button>
              )
            })}
          </div>
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-widest">Color themes</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {BUILTIN_APPEARANCE_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => onApplyPreset(preset)}
                className="text-left px-3 py-2 rounded border border-zinc-800 hover:border-zinc-600 bg-zinc-950/50 transition-colors"
              >
                <span className="block text-xs text-zinc-200">{preset.name}</span>
                <PresetSwatch theme={preset.theme} />
              </button>
            ))}
          </div>
        </div>

        {savedPresets.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-zinc-400 font-semibold uppercase tracking-widest">Your saved themes</p>
            <div className="flex flex-wrap gap-2">
              {savedPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => onApplyPreset(preset)}
                  className="px-2 py-1 text-xs rounded border border-zinc-700 text-zinc-300 hover:text-white"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={presetName}
            onChange={(e) => onPresetNameChange(e.target.value)}
            placeholder="Save current look as…"
            className="flex-1 font-mono text-xs bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-300"
          />
          <button
            type="button"
            onClick={onSavePreset}
            className="px-3 py-1.5 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            Save
          </button>
        </div>

        <div className="space-y-4 pt-2 border-t border-zinc-800">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-zinc-400 font-semibold uppercase tracking-widest">Backgrounds</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-md">
                One place for section surfaces: frosted panel plus optional grid lines. Page background is set in the Background tab.
              </p>
            </div>
            <button
              type="button"
              onClick={onApplyReadableMode}
              className="px-3 py-1.5 text-xs rounded border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors shrink-0"
            >
              Readable defaults
            </button>
          </div>
          <AppearanceOpacitySlider
            label="Section background"
            value={sectionPanelOpacity}
            onChange={(value) => {
              onSectionPanelOpacityChange(value)
              if (value === 0) onSectionGridOpacityChange(0)
            }}
            description="Frosted panel and border around each section. At 0%, panels and borders disappear."
          />
          <AppearanceOpacitySlider
            label="Grid lines on sections"
            value={sectionGridOpacity}
            onChange={onSectionGridOpacityChange}
            description="Accent grid inside section panels. Set to 0% to hide."
            disabled={sectionPanelOpacity === 0}
          />
          <AppearanceOpacitySlider
            label="Card background"
            value={cardSurfaceOpacity}
            onChange={onCardSurfaceOpacityChange}
            description="Individual items (releases, gigs, tiles). Keep above ~50% when sections are transparent."
          />
          {sectionPanelOpacity < 0.2 && (
            <p className="text-xs text-amber-500/90">
              Low section background makes text harder to read against animated backgrounds.
            </p>
          )}
        </div>
      </AdminAccordion>
  )
}
