'use client'

import { AdminAccordion } from '@/app/admin/_components/AdminAccordion'
import { AppearanceOpacitySlider } from './AppearanceOpacitySlider'
import * as SwitchPrimitive from '@radix-ui/react-switch'

export interface AppearanceVisualEffectsProps {
  crtEnabled: boolean
  scanlineEnabled: boolean
  noiseEnabled: boolean
  glitchEnabled: boolean
  filmGrain: boolean
  noiseIntensity: number
  vignetteOpacity: number
  chromaticStrength: number
  onCrtEnabledChange: (value: boolean) => void
  onScanlineEnabledChange: (value: boolean) => void
  onNoiseEnabledChange: (value: boolean) => void
  onGlitchEnabledChange: (value: boolean) => void
  onFilmGrainChange: (value: boolean) => void
  onNoiseIntensityChange: (value: number) => void
  onVignetteOpacityChange: (value: number) => void
  onChromaticStrengthChange: (value: number) => void
}

/** Controlled presentation of the original visual-effect switches and sliders. */
export function AppearanceVisualEffects({
  crtEnabled,
  scanlineEnabled,
  noiseEnabled,
  glitchEnabled,
  filmGrain,
  noiseIntensity,
  vignetteOpacity,
  chromaticStrength,
  onCrtEnabledChange,
  onScanlineEnabledChange,
  onNoiseEnabledChange,
  onGlitchEnabledChange,
  onFilmGrainChange,
  onNoiseIntensityChange,
  onVignetteOpacityChange,
  onChromaticStrengthChange,
}: AppearanceVisualEffectsProps) {
  return (
      <AdminAccordion title="Visual effects" description="CRT overlay, scanlines and intensity">
        {[
          { label: 'CRT overlay & vignette', checked: crtEnabled, onChange: onCrtEnabledChange },
          { label: 'Scanlines', checked: scanlineEnabled, onChange: onScanlineEnabledChange },
          { label: 'Noise / grain', checked: noiseEnabled, onChange: onNoiseEnabledChange },
          { label: 'Glitch', checked: glitchEnabled, onChange: onGlitchEnabledChange },
          { label: 'Film grain pattern (denser)', checked: filmGrain, onChange: onFilmGrainChange },
        ].map(({ label, checked, onChange }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-zinc-300">{label}</span>
            <SwitchPrimitive.Root
              checked={checked}
              onCheckedChange={onChange}
              className="relative inline-flex h-5 w-9 items-center rounded-full border border-zinc-600 transition-colors data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-zinc-700"
            >
              <SwitchPrimitive.Thumb className="pointer-events-none block size-3.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5" />
            </SwitchPrimitive.Root>
          </div>
        ))}

        <div className="space-y-4 pt-2 border-t border-zinc-800">
          <AppearanceOpacitySlider
            label="Noise grain intensity"
            value={noiseIntensity}
            onChange={onNoiseIntensityChange}
            description="Strength of the full-page grain overlay (only when Noise is on)."
          />
          <AppearanceOpacitySlider
            label="Vignette (dark edges)"
            value={vignetteOpacity}
            onChange={onVignetteOpacityChange}
            description="Darkening around the screen edges."
          />
          <AppearanceOpacitySlider
            label="Chromatic aberration"
            value={chromaticStrength}
            onChange={onChromaticStrengthChange}
            description="Full-page RGB fringe + stronger hover fringing. 0 = off, 1 = strong."
          />
        </div>
      </AdminAccordion>
  )
}
