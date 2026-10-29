'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateSiteConfig } from '@/app/admin/_actions/siteConfig'
import { AppearanceColorsFonts } from './AppearanceColorsFonts'
import { AdminAccordion } from '@/app/admin/_components/AdminAccordion'
import { resolveImageUrl } from '@/lib/r2'
import { broadcastAdminDraft } from '@/lib/admin-draft-channel'
import {
  BUILTIN_APPEARANCE_PRESETS,
  type AppearanceTheme,
  type SavedAppearancePreset,
} from '@/lib/appearance-presets'
import { LOOKS, type LookDefinition } from '@/lib/looks'
import { getAllOverlayAnimations } from '@/lib/overlay-animations'
import {
  DEFAULTS,
  DEFAULT_THEME,
  parseConfig,
  type AppearanceConfig,
} from '@/lib/admin-appearance-config'
import { oklchToHex } from '@/lib/color-utils'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import * as SliderPrimitive from '@radix-ui/react-slider'
import * as SwitchPrimitive from '@radix-ui/react-switch'

/** Swatch colors for preset preview — oklch applied directly (hex conversion fails during SSR). */
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

function OpacitySlider({
  label,
  value,
  onChange,
  description,
  disabled = false,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  description: string
  disabled?: boolean
}) {
  return (
    <div className={`space-y-2 ${disabled ? 'opacity-50' : ''}`}>
      <label className="block text-xs text-zinc-400">
        {label}: <span className="font-mono text-zinc-300">{Math.round(value * 100)}%</span>
      </label>
      <SliderPrimitive.Root
        min={0}
        max={1}
        step={0.05}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        disabled={disabled}
        className="relative flex items-center w-full h-5"
        aria-label={label}
      >
        <SliderPrimitive.Track className="relative h-1 grow rounded-full bg-zinc-700">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-red-500" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block size-4 rounded-full border border-red-500 bg-zinc-900" />
      </SliderPrimitive.Root>
      <p className="text-xs text-zinc-500">{description}</p>
    </div>
  )
}

interface AppearanceEditorProps {
  currentValue: Record<string, unknown>
}

export function AppearanceEditor({ currentValue }: AppearanceEditorProps) {
  const router = useRouter()
  const init = useMemo(() => parseConfig(currentValue), [currentValue])

  const [crtEnabled, setCrtEnabled] = useState(init.crtEnabled)
  const [scanlineEnabled, setScanlineEnabled] = useState(init.scanlineEnabled)
  const [noiseEnabled, setNoiseEnabled] = useState(init.noiseEnabled)
  const [glitchEnabled, setGlitchEnabled] = useState(init.glitchEnabled)
  const [noiseIntensity, setNoiseIntensity] = useState(init.noiseIntensity)
  const [filmGrain, setFilmGrain] = useState(init.filmGrain)
  const [accentColor, setAccentColor] = useState(init.accentColor)
  const [accentColorSecondary] = useState(init.accentColorSecondary)
  const [vignetteOpacity, setVignetteOpacity] = useState(init.vignetteOpacity)
  const [chromaticStrength, setChromaticStrength] = useState(init.chromaticStrength)
  const [sectionPanelOpacity, setSectionPanelOpacity] = useState(init.sectionPanelOpacity)
  const [sectionGridOpacity, setSectionGridOpacity] = useState(init.sectionGridOpacity)
  const [cardSurfaceOpacity, setCardSurfaceOpacity] = useState(init.cardSurfaceOpacity)
  const [faviconStoragePath, setFaviconStoragePath] = useState(init.faviconStoragePath ?? '')
  const [faviconUrl, setFaviconUrl] = useState(
    resolveImageUrl(init.faviconStoragePath, init.faviconUrl) ?? '',
  )
  const [theme, setTheme] = useState<AppearanceTheme>(init.theme ?? DEFAULT_THEME)
  const [lookId, setLookId] = useState(init.lookId ?? 'neuroklast-classic')
  const [overlayAnimations, setOverlayAnimations] = useState<string[]>(
    init.overlayAnimations ?? DEFAULTS.overlayAnimations ?? [],
  )
  const [savedPresets, setSavedPresets] = useState<SavedAppearancePreset[]>(init.savedPresets ?? [])
  const [presetName, setPresetName] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(init))

  const payload = useMemo<AppearanceConfig>(
    () => ({
      crtEnabled,
      scanlineEnabled,
      noiseEnabled,
      glitchEnabled,
      noiseIntensity,
      filmGrain,
      accentColor,
      accentColorSecondary,
      vignetteOpacity,
      chromaticStrength,
      sectionPanelOpacity,
      sectionGridOpacity,
      cardSurfaceOpacity,
      faviconUrl: faviconUrl || null,
      faviconStoragePath: faviconStoragePath || null,
      theme,
      lookId,
      overlayAnimations,
      overlayAnimation: overlayAnimations[0] ?? DEFAULTS.overlayAnimation,
      savedPresets,
    }),
    [
      crtEnabled,
      scanlineEnabled,
      noiseEnabled,
      glitchEnabled,
      noiseIntensity,
      filmGrain,
      accentColor,
      accentColorSecondary,
      vignetteOpacity,
      chromaticStrength,
      sectionPanelOpacity,
      sectionGridOpacity,
      cardSurfaceOpacity,
      faviconUrl,
      faviconStoragePath,
      theme,
      lookId,
      overlayAnimations,
      savedPresets,
    ],
  )

  useUnsavedChanges(JSON.stringify(payload) !== savedSnapshot)

  useEffect(() => {
    broadcastAdminDraft('appearance', payload as unknown as Record<string, unknown>)
  }, [payload])

  function applyLook(look: LookDefinition) {
    setLookId(look.id)
    setTheme({ ...look.theme })
    if (look.theme.accentColor) setAccentColor(oklchToHex(look.theme.accentColor))
    setChromaticStrength(look.overlayEffects.chromatic?.enabled ? look.overlayEffects.chromatic.intensity : 0)
    setNoiseIntensity(look.overlayEffects.noise?.intensity ?? 0.15)
    setVignetteOpacity(look.overlayEffects.vignette?.intensity ?? 0.5)
    setCrtEnabled(look.overlayEffects.crt?.enabled !== false)
    setScanlineEnabled(look.overlayEffects.scanlines?.enabled !== false)
    setNoiseEnabled(look.overlayEffects.noise?.enabled !== false)
  }

  function applyPreset(preset: SavedAppearancePreset) {
    setTheme({ ...preset.theme })
    if (preset.theme.accentColor) setAccentColor(oklchToHex(preset.theme.accentColor))
  }

  function applyReadableMode() {
    setSectionPanelOpacity(0.7)
    setCardSurfaceOpacity(0.9)
  }

  function updateThemeField(key: keyof AppearanceTheme, value: string) {
    setTheme((prev) => ({ ...prev, [key]: value }))
    if (key === 'accentColor') setAccentColor(oklchToHex(value))
  }

  function saveCustomPreset() {
    const name = presetName.trim()
    if (!name) return
    const next = [...savedPresets.filter((p) => p.name !== name), { name, theme: { ...theme } }]
    setSavedPresets(next)
    setPresetName('')
  }

  async function handleSave() {
    setStatus('saving')
    setErrorMsg(null)
    const fd = new FormData()
    fd.set('key', 'appearance')
    fd.set('value', JSON.stringify(payload))
    const result = await updateSiteConfig(fd)
    if (result.error) {
      setStatus('error')
      setErrorMsg(result.error)
    } else {
      setStatus('saved')
      setSavedSnapshot(JSON.stringify(payload))
      // Push saved theme to open public tabs immediately
      const { broadcastAdminRefresh } = await import('@/lib/admin-draft-channel')
      broadcastAdminRefresh()
      router.refresh()
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  return (
    <div className="border border-zinc-800 rounded p-4 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-zinc-200">Theme</h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Start with a preset, adjust surfaces, then fine-tune colors and effects. Preview updates live.
        </p>
      </div>

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
                onClick={() => applyLook(look)}
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
                onClick={() => applyPreset(preset)}
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
                  onClick={() => applyPreset(preset)}
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
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Save current look as…"
            className="flex-1 font-mono text-xs bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-300"
          />
          <button
            type="button"
            onClick={saveCustomPreset}
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
              onClick={applyReadableMode}
              className="px-3 py-1.5 text-xs rounded border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors shrink-0"
            >
              Readable defaults
            </button>
          </div>
          <OpacitySlider
            label="Section background"
            value={sectionPanelOpacity}
            onChange={(value) => {
              setSectionPanelOpacity(value)
              if (value === 0) setSectionGridOpacity(0)
            }}
            description="Frosted panel and border around each section. At 0%, panels and borders disappear."
          />
          <OpacitySlider
            label="Grid lines on sections"
            value={sectionGridOpacity}
            onChange={setSectionGridOpacity}
            description="Accent grid inside section panels. Set to 0% to hide."
            disabled={sectionPanelOpacity === 0}
          />
          <OpacitySlider
            label="Card background"
            value={cardSurfaceOpacity}
            onChange={setCardSurfaceOpacity}
            description="Individual items (releases, gigs, tiles). Keep above ~50% when sections are transparent."
          />
          {sectionPanelOpacity < 0.2 && (
            <p className="text-xs text-amber-500/90">
              Low section background makes text harder to read against animated backgrounds.
            </p>
          )}
        </div>
      </AdminAccordion>

      <AppearanceColorsFonts
        theme={theme}
        onThemeFieldChange={updateThemeField}
        faviconUrl={faviconUrl}
        faviconStoragePath={faviconStoragePath}
        onFaviconStoragePathChange={setFaviconStoragePath}
        onFaviconUrlChange={setFaviconUrl}
        onError={setErrorMsg}
      />

      <AdminAccordion title="Visual effects" description="CRT overlay, scanlines and intensity">
        {[
          { label: 'CRT overlay & vignette', checked: crtEnabled, onChange: setCrtEnabled },
          { label: 'Scanlines', checked: scanlineEnabled, onChange: setScanlineEnabled },
          { label: 'Noise / grain', checked: noiseEnabled, onChange: setNoiseEnabled },
          { label: 'Glitch', checked: glitchEnabled, onChange: setGlitchEnabled },
          { label: 'Film grain pattern (denser)', checked: filmGrain, onChange: setFilmGrain },
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
          <OpacitySlider
            label="Noise grain intensity"
            value={noiseIntensity}
            onChange={setNoiseIntensity}
            description="Strength of the full-page grain overlay (only when Noise is on)."
          />
          <OpacitySlider
            label="Vignette (dark edges)"
            value={vignetteOpacity}
            onChange={setVignetteOpacity}
            description="Darkening around the screen edges."
          />
          <OpacitySlider
            label="Chromatic aberration"
            value={chromaticStrength}
            onChange={setChromaticStrength}
            description="Full-page RGB fringe + stronger hover fringing. 0 = off, 1 = strong."
          />
        </div>
      </AdminAccordion>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={status === 'saving'}
          className="px-3 py-1.5 text-sm rounded bg-zinc-700 hover:bg-zinc-600 text-white disabled:opacity-50"
        >
          {status === 'saving' ? 'Saving…' : 'Save theme'}
        </button>
        {status === 'saved' && <span className="text-xs text-green-400">Saved</span>}
        {status === 'error' && <span className="text-xs text-red-400">{errorMsg ?? 'Error'}</span>}
      </div>
    </div>
  )
}