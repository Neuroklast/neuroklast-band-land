'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateSiteConfig } from '@/app/admin/_actions/siteConfig'
import { AppearanceColorsFonts } from './AppearanceColorsFonts'
import { AppearanceQuickStart } from './AppearanceQuickStart'
import { AppearanceVisualEffects } from './AppearanceVisualEffects'
import { composeAppearancePayload } from '@/lib/admin-appearance-payload'
import { resolveImageUrl } from '@/lib/r2'
import { broadcastAdminDraft } from '@/lib/admin-draft-channel'
import { type AppearanceTheme, type SavedAppearancePreset } from '@/lib/appearance-presets'
import { type LookDefinition } from '@/lib/looks'
import {
  DEFAULTS,
  DEFAULT_THEME,
  parseConfig,
  type AppearanceConfig,
} from '@/lib/admin-appearance-config'
import { oklchToHex } from '@/lib/color-utils'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'

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
    () => composeAppearancePayload({
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

      <AppearanceQuickStart
        lookId={lookId}
        overlayAnimations={overlayAnimations}
        setOverlayAnimations={setOverlayAnimations}
        onApplyLook={applyLook}
        onApplyPreset={applyPreset}
        savedPresets={savedPresets}
        presetName={presetName}
        onPresetNameChange={setPresetName}
        onSavePreset={saveCustomPreset}
        sectionPanelOpacity={sectionPanelOpacity}
        sectionGridOpacity={sectionGridOpacity}
        cardSurfaceOpacity={cardSurfaceOpacity}
        onSectionPanelOpacityChange={setSectionPanelOpacity}
        onSectionGridOpacityChange={setSectionGridOpacity}
        onCardSurfaceOpacityChange={setCardSurfaceOpacity}
        onApplyReadableMode={applyReadableMode}
      />

      <AppearanceColorsFonts
        theme={theme}
        onThemeFieldChange={updateThemeField}
        faviconUrl={faviconUrl}
        faviconStoragePath={faviconStoragePath}
        onFaviconStoragePathChange={setFaviconStoragePath}
        onFaviconUrlChange={setFaviconUrl}
        onError={setErrorMsg}
      />

      <AppearanceVisualEffects
        crtEnabled={crtEnabled}
        scanlineEnabled={scanlineEnabled}
        noiseEnabled={noiseEnabled}
        glitchEnabled={glitchEnabled}
        filmGrain={filmGrain}
        noiseIntensity={noiseIntensity}
        vignetteOpacity={vignetteOpacity}
        chromaticStrength={chromaticStrength}
        onCrtEnabledChange={setCrtEnabled}
        onScanlineEnabledChange={setScanlineEnabled}
        onNoiseEnabledChange={setNoiseEnabled}
        onGlitchEnabledChange={setGlitchEnabled}
        onFilmGrainChange={setFilmGrain}
        onNoiseIntensityChange={setNoiseIntensity}
        onVignetteOpacityChange={setVignetteOpacity}
        onChromaticStrengthChange={setChromaticStrength}
      />

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