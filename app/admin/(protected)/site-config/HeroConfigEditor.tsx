'use client'

import { useEffect, useMemo, useReducer, useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateSiteConfig } from '@/app/admin/_actions/siteConfig'
import { HeroWordmarkControls } from './HeroWordmarkControls'
import { HeroBackgroundControls } from './HeroBackgroundControls'
import { HeroGlitchControls } from './HeroGlitchControls'
import { broadcastAdminDraft } from '@/lib/admin-draft-channel'
import { DEFAULT_HERO_LOGO_URL } from '@/lib/hero-defaults'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import { composeHeroPayload, createHeroEditorDraft, heroEditorReducer } from '@/lib/admin-hero-draft'

interface HeroConfigEditorProps {
  currentValue: Record<string, unknown>
}

export function HeroConfigEditor({ currentValue }: HeroConfigEditorProps) {
  const router = useRouter()
  const [draft, dispatch] = useReducer(heroEditorReducer, currentValue, createHeroEditorDraft)
  const {
    headline,
    tagline,
    ctaLabel,
    ctaUrl,
    logoImageStoragePath,
    logoImageUrl,
    backgroundImageStoragePath,
    backgroundImageUrl,
    backgroundImageOpacity,
    bootSequenceEnabled,
    logoWidthPercent,
    logoWidthPercentMobile,
    powerGlitch,
  } = draft
  const {
    mode: glitchMode,
    durationMs: glitchDurationMs,
    sliceCount: glitchSliceCount,
    shake: glitchShake,
    hueRotate: glitchHue,
    pulse: glitchPulse,
    continuous: glitchContinuous,
  } = powerGlitch

  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [savedSnapshot, setSavedSnapshot] = useState('')

  const resolvedLogoPreview = logoImageUrl || DEFAULT_HERO_LOGO_URL

  const draftPayload = useMemo(() => composeHeroPayload(draft), [draft])

  useEffect(() => {
    setSavedSnapshot((current) => current || JSON.stringify(draftPayload))
  }, [draftPayload])

  useUnsavedChanges(Boolean(savedSnapshot) && JSON.stringify(draftPayload) !== savedSnapshot)

  useEffect(() => {
    broadcastAdminDraft('hero', {
      ...draftPayload,
      logoImageUrl: resolvedLogoPreview,
    })
  }, [draftPayload, resolvedLogoPreview])

  async function handleSave() {
    setStatus('saving')
    setErrorMsg(null)
    const fd = new FormData()
    fd.set('key', 'hero')
    fd.set('value', JSON.stringify(draftPayload))
    const result = await updateSiteConfig(fd)
    if (result.error) {
      setStatus('error')
      setErrorMsg(result.error)
    } else {
      setStatus('saved')
      setSavedSnapshot(JSON.stringify(draftPayload))
      const { broadcastAdminRefresh } = await import('@/lib/admin-draft-channel')
      broadcastAdminRefresh()
      router.refresh()
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  return (
    <div className="border border-zinc-800 rounded p-4 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-zinc-200">Hero Section</h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Wordmark image, tagline, CTAs and optional hero-only background overlay.
        </p>
      </div>

      <div className="space-y-3">
        <HeroWordmarkControls
          logoImageUrl={logoImageUrl}
          logoImageStoragePath={logoImageStoragePath}
          logoWidthPercent={logoWidthPercent}
          logoWidthPercentMobile={logoWidthPercentMobile}
          onLogoResolved={(path, publicUrl) => {
            dispatch({ type: 'logoResolved', path, publicUrl })
            setErrorMsg(null)
          }}
          onResetLogo={() => dispatch({ type: 'resetLogo' })}
          onDesktopWidthChange={(value) => dispatch({ type: 'patch', changes: { logoWidthPercent: value } })}
          onMobileWidthChange={(value) => dispatch({ type: 'patch', changes: { logoWidthPercentMobile: value } })}
          onError={setErrorMsg}
        />

        <div className="space-y-1">
          <label htmlFor="hero-alt-text" className="block text-xs text-zinc-400 font-semibold uppercase tracking-widest">Alt text</label>
          <input
            id="hero-alt-text"
            type="text"
            value={headline}
            onChange={(e) => dispatch({ type: 'patch', changes: { headline: e.target.value } })}
            className="w-full font-mono text-xs bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-300 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="hero-tagline" className="block text-xs text-zinc-400 font-semibold uppercase tracking-widest">Tagline</label>
          <input
            id="hero-tagline"
            type="text"
            value={tagline}
            onChange={(e) => dispatch({ type: 'patch', changes: { tagline: e.target.value } })}
            className="w-full font-mono text-xs bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-300 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="hero-cta-label" className="block text-xs text-zinc-400 font-semibold uppercase tracking-widest">CTA Label</label>
            <input
              id="hero-cta-label"
              type="text"
              value={ctaLabel}
              onChange={(e) => dispatch({ type: 'patch', changes: { ctaLabel: e.target.value } })}
              className="w-full font-mono text-xs bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-300 focus:outline-none focus:border-zinc-600"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="hero-cta-url" className="block text-xs text-zinc-400 font-semibold uppercase tracking-widest">CTA URL</label>
            <input
              id="hero-cta-url"
              type="text"
              value={ctaUrl}
              onChange={(e) => dispatch({ type: 'patch', changes: { ctaUrl: e.target.value } })}
              className="w-full font-mono text-xs bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-300 focus:outline-none focus:border-zinc-600"
            />
          </div>
        </div>

        <HeroBackgroundControls
          backgroundImageUrl={backgroundImageUrl}
          backgroundImageStoragePath={backgroundImageStoragePath}
          backgroundImageOpacity={backgroundImageOpacity}
          onBackgroundResolved={(path, publicUrl) => {
            dispatch({ type: 'backgroundResolved', path, publicUrl })
            setErrorMsg(null)
          }}
          onBackgroundCleared={() => {
            dispatch({ type: 'clearBackground' })
            setErrorMsg(null)
          }}
          onOpacityChange={(value) => dispatch({ type: 'patch', changes: { backgroundImageOpacity: value } })}
          onError={setErrorMsg}
        />

        <div className="flex flex-wrap items-start justify-between gap-3 pt-2 border-t border-zinc-800">
          <div>
            <p className="text-xs text-zinc-400 font-semibold uppercase tracking-widest">Wordmark boot sequence</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
              Short filmic entrance (~1.2s): scan reveal, RGB fringe, mini load bar and micro terminal lines. Off =
              logo shows immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: 'toggleBoot' })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              bootSequenceEnabled ? 'bg-red-600' : 'bg-zinc-700'
            }`}
            role="switch"
            aria-checked={bootSequenceEnabled}
            aria-label="Enable wordmark boot sequence"
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
                bootSequenceEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <p className="text-xs font-mono text-zinc-400">
          Boot sequence: {bootSequenceEnabled ? 'ON' : 'OFF'}
        </p>

        <HeroGlitchControls
          mode={glitchMode}
          durationMs={glitchDurationMs}
          sliceCount={glitchSliceCount}
          shake={glitchShake}
          hueRotate={glitchHue}
          pulse={glitchPulse}
          continuous={glitchContinuous}
          onModeChange={(value) => dispatch({ type: 'powerGlitch', changes: { mode: value } })}
          onDurationMsChange={(value) => dispatch({ type: 'powerGlitch', changes: { durationMs: value } })}
          onSliceCountChange={(value) => dispatch({ type: 'powerGlitch', changes: { sliceCount: value } })}
          onShakeChange={(value) => dispatch({ type: 'powerGlitch', changes: { shake: value } })}
          onHueRotateChange={(value) => dispatch({ type: 'powerGlitch', changes: { hueRotate: value } })}
          onPulseChange={(value) => dispatch({ type: 'powerGlitch', changes: { pulse: value } })}
          onContinuousChange={(value) => dispatch({ type: 'powerGlitch', changes: { continuous: value } })}
        />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={status === 'saving'}
          className="px-3 py-1.5 text-sm rounded bg-zinc-700 hover:bg-zinc-600 text-white transition-colors disabled:opacity-50"
        >
          {status === 'saving' ? 'Saving…' : 'Save'}
        </button>
        {status === 'saved' && <span className="text-xs text-green-400">Saved</span>}
        {status === 'error' && <span className="text-xs text-red-400">{errorMsg ?? 'Error'}</span>}
      </div>
    </div>
  )
}