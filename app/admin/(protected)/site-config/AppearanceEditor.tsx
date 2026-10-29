'use client'

import { useEffect, useMemo, useReducer, useState, type SetStateAction } from 'react'
import { useRouter } from 'next/navigation'
import { updateSiteConfig } from '@/app/admin/_actions/siteConfig'
import { AppearanceColorsFonts } from './AppearanceColorsFonts'
import { AppearanceQuickStart } from './AppearanceQuickStart'
import { AppearanceVisualEffects } from './AppearanceVisualEffects'
import { composeAppearancePayload } from '@/lib/admin-appearance-payload'
import { createAppearanceDraft, appearanceDraftReducer } from '@/lib/admin-appearance-reducer'
import { broadcastAdminDraft } from '@/lib/admin-draft-channel'
import { parseConfig, type AppearanceConfig } from '@/lib/admin-appearance-config'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import type { AppearanceTheme, SavedAppearancePreset } from '@/lib/appearance-presets'
import type { LookDefinition } from '@/lib/looks'

interface AppearanceEditorProps {
  currentValue: Record<string, unknown>
}

export function AppearanceEditor({ currentValue }: AppearanceEditorProps) {
  const router = useRouter()
  const init = useMemo(() => parseConfig(currentValue), [currentValue])

  const [draft, dispatch] = useReducer(appearanceDraftReducer, init, createAppearanceDraft)
  const {
    crtEnabled,
    scanlineEnabled,
    noiseEnabled,
    glitchEnabled,
    noiseIntensity,
    filmGrain,
    vignetteOpacity,
    chromaticStrength,
    sectionPanelOpacity,
    sectionGridOpacity,
    cardSurfaceOpacity,
    faviconStoragePath,
    faviconUrl,
    theme,
    lookId,
    overlayAnimations,
    savedPresets,
  } = draft

  // Keep the child animation toggle's functional updater semantics.
  const setOverlayAnimations = (update: SetStateAction<string[]>) => {
    dispatch({ type: 'overlayAnimations', update })
  }

  const [presetName, setPresetName] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(init))

  const payload = useMemo<AppearanceConfig>(() => composeAppearancePayload(draft), [draft])

  useUnsavedChanges(JSON.stringify(payload) !== savedSnapshot)

  useEffect(() => {
    broadcastAdminDraft('appearance', payload as unknown as Record<string, unknown>)
  }, [payload])

  function applyLook(look: LookDefinition) {
    dispatch({ type: 'applyLook', look })
  }

  function applyPreset(preset: SavedAppearancePreset) {
    dispatch({ type: 'applyPreset', preset })
  }

  function applyReadableMode() {
    dispatch({ type: 'readableMode' })
  }

  function updateThemeField(key: keyof AppearanceTheme, value: string) {
    dispatch({ type: 'themeField', key, value })
  }

  function saveCustomPreset() {
    if (!presetName.trim()) return
    dispatch({ type: 'savePreset', name: presetName })
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
        onSectionPanelOpacityChange={(value) => dispatch({ type: 'patch', values: { sectionPanelOpacity: value } })}
        onSectionGridOpacityChange={(value) => dispatch({ type: 'patch', values: { sectionGridOpacity: value } })}
        onCardSurfaceOpacityChange={(value) => dispatch({ type: 'patch', values: { cardSurfaceOpacity: value } })}
        onApplyReadableMode={applyReadableMode}
      />

      <AppearanceColorsFonts
        theme={theme}
        onThemeFieldChange={updateThemeField}
        faviconUrl={faviconUrl}
        faviconStoragePath={faviconStoragePath}
        onFaviconStoragePathChange={(value) => dispatch({ type: 'patch', values: { faviconStoragePath: value } })}
        onFaviconUrlChange={(value) => dispatch({ type: 'patch', values: { faviconUrl: value } })}
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
        onCrtEnabledChange={(value) => dispatch({ type: 'patch', values: { crtEnabled: value } })}
        onScanlineEnabledChange={(value) => dispatch({ type: 'patch', values: { scanlineEnabled: value } })}
        onNoiseEnabledChange={(value) => dispatch({ type: 'patch', values: { noiseEnabled: value } })}
        onGlitchEnabledChange={(value) => dispatch({ type: 'patch', values: { glitchEnabled: value } })}
        onFilmGrainChange={(value) => dispatch({ type: 'patch', values: { filmGrain: value } })}
        onNoiseIntensityChange={(value) => dispatch({ type: 'patch', values: { noiseIntensity: value } })}
        onVignetteOpacityChange={(value) => dispatch({ type: 'patch', values: { vignetteOpacity: value } })}
        onChromaticStrengthChange={(value) => dispatch({ type: 'patch', values: { chromaticStrength: value } })}
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