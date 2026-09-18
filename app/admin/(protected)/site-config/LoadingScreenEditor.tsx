'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateSiteConfig } from '@/app/admin/_actions/siteConfig'
import { MediaSourcePicker } from '@/app/admin/_components/MediaSourcePicker'
import { broadcastAdminDraft } from '@/lib/admin-draft-channel'
import { resolveImageUrl } from '@/lib/r2'
import {
  DEFAULT_LOADING_BOOT_LABEL,
  DEFAULT_LOADING_CODE_FRAGMENTS,
  DEFAULT_LOADING_HACKING_TEXTS,
  DEFAULT_LOADING_LOGO,
  MAX_LOADING_LOGO_SIZE_PX,
  MIN_LOADING_LOGO_SIZE_PX,
  parseLoadingScreenConfig,
} from '@/lib/loading-screen-config'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'

interface LoadingScreenEditorProps {
  currentValue: Record<string, unknown>
}

export function LoadingScreenEditor({ currentValue }: LoadingScreenEditorProps) {
  const router = useRouter()
  const parsed = parseLoadingScreenConfig(currentValue)
  const [enabled, setEnabled] = useState(parsed.enabled)
  const [logoStoragePath, setLogoStoragePath] = useState(parsed.logoStoragePath)
  const [logoUrl, setLogoUrl] = useState(
    resolveImageUrl(parsed.logoStoragePath || null, parsed.logoUrl) ?? parsed.logoUrl,
  )
  const [bootLabel, setBootLabel] = useState(parsed.bootLabel)
  const [hackingTexts, setHackingTexts] = useState(parsed.hackingTexts.join('\n'))
  const [codeFragments, setCodeFragments] = useState(parsed.codeFragments.join('\n'))
  const [durationSeconds, setDurationSeconds] = useState(Math.round(parsed.durationMs / 1000))
  const [logoSizePx, setLogoSizePx] = useState(parsed.logoSizePx)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [savedSnapshot, setSavedSnapshot] = useState('')

  const draftPayload = useMemo(
    () => ({
      enabled,
      logoStoragePath: logoStoragePath || null,
      logoUrl: logoUrl || null,
      bootLabel,
      hackingTexts,
      codeFragments,
      durationMs: durationSeconds * 1000,
      logoSizePx,
    }),
    [enabled, logoStoragePath, logoUrl, bootLabel, hackingTexts, codeFragments, durationSeconds, logoSizePx],
  )

  useEffect(() => {
    setSavedSnapshot((current) => current || JSON.stringify(draftPayload))
  }, [draftPayload])

  useUnsavedChanges(Boolean(savedSnapshot) && JSON.stringify(draftPayload) !== savedSnapshot)

  useEffect(() => {
    broadcastAdminDraft('loadingScreen', draftPayload)
  }, [draftPayload])

  async function handleSave() {
    setStatus('saving')
    setErrorMsg(null)
    const fd = new FormData()
    fd.set('key', 'loadingScreen')
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
        <h2 className="text-sm font-semibold text-zinc-200">Loading Screen</h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Full-page boot overlay: icon, duration, status lines and footer label.
        </p>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Show on visit</p>
          <p className="mt-1 max-w-sm text-xs text-zinc-500">Off skips the boot overlay entirely.</p>
        </div>
        <button
          type="button"
          onClick={() => setEnabled((value) => !value)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            enabled ? 'bg-red-600' : 'bg-zinc-700'
          }`}
          role="switch"
          aria-checked={enabled}
          aria-label="Enable loading screen"
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <MediaSourcePicker
        label="Loading icon"
        currentUrl={logoUrl || DEFAULT_LOADING_LOGO}
        currentStoragePath={logoStoragePath || null}
        storagePrefix="site/loading-logo"
        editorFitMode="contain"
        editorAspectRatio={1}
        onResolved={(path, publicUrl) => {
          setLogoStoragePath(path)
          if (publicUrl) setLogoUrl(publicUrl)
          setErrorMsg(null)
        }}
        onCleared={() => {
          setLogoStoragePath('')
          setLogoUrl(DEFAULT_LOADING_LOGO)
          setErrorMsg(null)
        }}
        onError={setErrorMsg}
      />
      <button
        type="button"
        onClick={() => {
          setLogoStoragePath('')
          setLogoUrl(DEFAULT_LOADING_LOGO)
        }}
        className="text-xs text-zinc-500 underline hover:text-zinc-300"
      >
        Reset to default icon
      </button>

      <label htmlFor="loading-boot-label" className="block space-y-1">
        <span className="block text-xs font-semibold uppercase tracking-widest text-zinc-400">Footer label</span>
        <input
          id="loading-boot-label"
          value={bootLabel}
          onChange={(e) => setBootLabel(e.target.value)}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          placeholder={DEFAULT_LOADING_BOOT_LABEL}
        />
      </label>

      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Logo size — {logoSizePx}px
        </label>
        <SliderPrimitive.Root
          aria-label="Logo size"
          min={MIN_LOADING_LOGO_SIZE_PX}
          max={MAX_LOADING_LOGO_SIZE_PX}
          step={8}
          value={[logoSizePx]}
          onValueChange={([value]) => setLogoSizePx(value)}
          className="relative flex h-5 w-full touch-none select-none items-center"
        >
          <SliderPrimitive.Track className="relative h-1 grow rounded-full bg-zinc-700">
            <SliderPrimitive.Range className="absolute h-full rounded-full bg-red-500" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="block size-4 cursor-grab rounded-full border border-red-500 bg-zinc-900 shadow focus:outline-none" />
        </SliderPrimitive.Root>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Duration — {durationSeconds}s
        </label>
        <SliderPrimitive.Root
          aria-label="Duration"
          min={1}
          max={8}
          step={1}
          value={[durationSeconds]}
          onValueChange={([value]) => setDurationSeconds(value)}
          className="relative flex h-5 w-full touch-none select-none items-center"
        >
          <SliderPrimitive.Track className="relative h-1 grow rounded-full bg-zinc-700">
            <SliderPrimitive.Range className="absolute h-full rounded-full bg-red-500" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="block size-4 cursor-grab rounded-full border border-red-500 bg-zinc-900 shadow focus:outline-none" />
        </SliderPrimitive.Root>
      </div>

      <label htmlFor="loading-status-lines" className="block space-y-1">
        <span className="block text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Status lines (one per line)
        </span>
        <textarea
          id="loading-status-lines"
          value={hackingTexts}
          onChange={(e) => setHackingTexts(e.target.value)}
          rows={8}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-100"
          placeholder={DEFAULT_LOADING_HACKING_TEXTS.join('\n')}
        />
      </label>

      <label htmlFor="loading-code-fragments" className="block space-y-1">
        <span className="block text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Code fragments (one per line)
        </span>
        <textarea
          id="loading-code-fragments"
          value={codeFragments}
          onChange={(e) => setCodeFragments(e.target.value)}
          rows={6}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-100"
          placeholder={DEFAULT_LOADING_CODE_FRAGMENTS.join('\n')}
        />
      </label>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={status === 'saving'}
          className="rounded bg-zinc-700 px-3 py-1.5 text-sm text-white transition-colors hover:bg-zinc-600 disabled:opacity-50"
        >
          {status === 'saving' ? 'Saving…' : 'Save'}
        </button>
        {status === 'saved' && <span className="text-xs text-green-400">Saved</span>}
        {status === 'error' && <span className="text-xs text-red-400">{errorMsg ?? 'Error'}</span>}
      </div>
    </div>
  )
}
