'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { broadcastAdminDraft } from '@/lib/admin-draft-channel'
import { updateSiteConfig } from '@/app/admin/_actions/siteConfig'
import { MediaSourcePicker } from '@/app/admin/_components/MediaSourcePicker'
import { BackgroundOpacitySlider } from './BackgroundOpacitySlider'
import { BackgroundDesktopVideoControls } from './BackgroundDesktopVideoControls'
import { BackgroundMobileVideoControls } from './BackgroundMobileVideoControls'
import { resolveImageUrl } from '@/lib/r2'
import { composeBackgroundPreview, composeBackgroundSave, type BackgroundEditorFields } from '@/lib/admin-background-payload'
import {
  DEFAULT_BACKGROUND_VIDEO_OPACITY,
  parseBackgroundVideoEnabled,
  parseMobileVideoMode,
  type MobileVideoMode,
} from '@/lib/background-config'
import {
  PUBLIC_BACKGROUND_TYPE_LABELS,
  PUBLIC_BACKGROUND_TYPES,
  parsePublicBackgroundType,
  type PublicBackgroundType,
} from '@/lib/public-background-types'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'

interface BackgroundConfigEditorProps {
  currentValue: Record<string, unknown>
}


export function BackgroundConfigEditor({ currentValue }: BackgroundConfigEditorProps) {
  const router = useRouter()
  const [imageStoragePath, setImageStoragePath] = useState(
    typeof currentValue.storage_path === 'string' ? currentValue.storage_path : '',
  )
  const [imageUrl, setImageUrl] = useState(
    resolveImageUrl(
      typeof currentValue.storage_path === 'string' ? currentValue.storage_path : null,
      typeof currentValue.url === 'string' ? currentValue.url : null,
    ) ?? '',
  )
  const [videoStoragePath, setVideoStoragePath] = useState(
    typeof currentValue.video_storage_path === 'string' ? currentValue.video_storage_path : '',
  )
  const [videoUrl, setVideoUrl] = useState(
    resolveImageUrl(
      typeof currentValue.video_storage_path === 'string' ? currentValue.video_storage_path : null,
      typeof currentValue.video_url === 'string' ? currentValue.video_url : null,
    ) ?? '',
  )
  const [mobileVideoStoragePath, setMobileVideoStoragePath] = useState(
    typeof currentValue.video_mobile_storage_path === 'string' ? currentValue.video_mobile_storage_path : '',
  )
  const [mobileVideoUrl, setMobileVideoUrl] = useState(
    resolveImageUrl(
      typeof currentValue.video_mobile_storage_path === 'string'
        ? currentValue.video_mobile_storage_path
        : null,
      typeof currentValue.video_mobile_url === 'string' ? currentValue.video_mobile_url : null,
    ) ?? '',
  )
  const [backgroundType, setBackgroundType] = useState<PublicBackgroundType>(() =>
    parsePublicBackgroundType(currentValue.backgroundType, 'matrix'),
  )
  const [backgroundImageOpacity, setBackgroundImageOpacity] = useState<number>(
    typeof currentValue.backgroundImageOpacity === 'number' ? currentValue.backgroundImageOpacity : 0.6,
  )
  const [backgroundVideoOpacity, setBackgroundVideoOpacity] = useState<number>(
    typeof currentValue.backgroundVideoOpacity === 'number'
      ? currentValue.backgroundVideoOpacity
      : DEFAULT_BACKGROUND_VIDEO_OPACITY,
  )
  const hasInitialVideo = Boolean(
    (typeof currentValue.video_storage_path === 'string' && currentValue.video_storage_path) ||
      (typeof currentValue.video_url === 'string' && currentValue.video_url),
  )
  const [backgroundVideoEnabled, setBackgroundVideoEnabled] = useState<boolean>(() =>
    parseBackgroundVideoEnabled(currentValue.backgroundVideoEnabled, hasInitialVideo),
  )
  const [mobileVideoMode, setMobileVideoMode] = useState<MobileVideoMode>(
    parseMobileVideoMode(currentValue.mobileVideoMode),
  )
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [savedSnapshot, setSavedSnapshot] = useState('')

  const fields = useMemo<BackgroundEditorFields>(
    () => ({
      imageStoragePath,
      imageUrl,
      videoStoragePath,
      videoUrl,
      mobileVideoStoragePath,
      mobileVideoUrl,
      mobileVideoMode,
      backgroundType,
      backgroundImageOpacity,
      backgroundVideoOpacity,
      backgroundVideoEnabled,
    }),
    [
      imageStoragePath,
      imageUrl,
      videoStoragePath,
      videoUrl,
      mobileVideoStoragePath,
      mobileVideoUrl,
      mobileVideoMode,
      backgroundType,
      backgroundImageOpacity,
      backgroundVideoOpacity,
      backgroundVideoEnabled,
    ],
  )
  const draftPayload = useMemo(() => composeBackgroundPreview(fields), [fields])

  useEffect(() => {
    setSavedSnapshot((current) => current || JSON.stringify(draftPayload))
  }, [draftPayload])

  useUnsavedChanges(Boolean(savedSnapshot) && JSON.stringify(draftPayload) !== savedSnapshot)

  useEffect(() => {
    broadcastAdminDraft('background', draftPayload)
  }, [draftPayload])

  function buildSavePayload() {
    return composeBackgroundSave(fields)
  }

  async function handleSave() {
    setStatus('saving')
    setErrorMsg(null)
    const fd = new FormData()
    fd.set('key', 'background')
    fd.set('value', JSON.stringify(buildSavePayload()))
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
        <h2 className="text-sm font-semibold text-zinc-200">Background</h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Site-wide image, scroll-synced video and animation layer. Preview updates live. Overlay glow
          colour is under Appearance → Modal glow.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs text-zinc-400 font-semibold uppercase tracking-widest">
          Animation style
        </label>
        <RadioGroupPrimitive.Root
          value={backgroundType}
          onValueChange={(v) => setBackgroundType(parsePublicBackgroundType(v))}
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
        >
          {PUBLIC_BACKGROUND_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-1.5 cursor-pointer">
              <RadioGroupPrimitive.Item
                value={type}
                className="size-4 shrink-0 rounded-full border border-zinc-600 data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500/20 focus:outline-none"
              >
                <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                  <span className="block size-2 rounded-full bg-red-500" />
                </RadioGroupPrimitive.Indicator>
              </RadioGroupPrimitive.Item>
              <span className="text-xs text-zinc-300">{PUBLIC_BACKGROUND_TYPE_LABELS[type]}</span>
            </label>
          ))}
        </RadioGroupPrimitive.Root>
        <p className="text-[11px] text-zinc-500">
          Terminal / data stream are GPU-light canvas layers (pause on hidden tab, reduced-motion off).
        </p>
      </div>

      <BackgroundOpacitySlider
        label="Background image opacity"
        value={backgroundImageOpacity}
        onChange={setBackgroundImageOpacity}
      />

      <MediaSourcePicker
        label="Background image"
        currentUrl={imageUrl || null}
        currentStoragePath={imageStoragePath || null}
        storagePrefix="background/images"
        editorAspectRatio={16 / 9}
        editorFitMode="cover"
        onResolved={(path, publicUrl) => {
          setImageStoragePath(path)
          if (publicUrl) setImageUrl(publicUrl)
          setErrorMsg(null)
        }}
        onCleared={() => {
          setImageStoragePath('')
          setImageUrl('')
          setErrorMsg(null)
        }}
        onError={setErrorMsg}
      />

      <BackgroundDesktopVideoControls
        backgroundVideoEnabled={backgroundVideoEnabled}
        videoUrl={videoUrl}
        videoStoragePath={videoStoragePath}
        backgroundVideoOpacity={backgroundVideoOpacity}
        onToggleEnabled={() => setBackgroundVideoEnabled((v) => !v)}
        onResolved={(path, publicUrl) => {
          setVideoStoragePath(path)
          if (publicUrl) setVideoUrl(publicUrl)
          setBackgroundVideoEnabled(true)
          setErrorMsg(null)
        }}
        onCleared={() => {
          setVideoStoragePath('')
          setVideoUrl('')
          setErrorMsg(null)
        }}
        onOpacityChange={setBackgroundVideoOpacity}
        onError={setErrorMsg}
      />

      <BackgroundMobileVideoControls
        mobileVideoMode={mobileVideoMode}
        mobileVideoUrl={mobileVideoUrl}
        mobileVideoStoragePath={mobileVideoStoragePath}
        onModeChange={setMobileVideoMode}
        onResolved={(path, publicUrl) => {
          setMobileVideoStoragePath(path)
          if (publicUrl) setMobileVideoUrl(publicUrl)
          setErrorMsg(null)
        }}
        onCleared={() => {
          setMobileVideoStoragePath('')
          setMobileVideoUrl('')
          setErrorMsg(null)
        }}
        onError={setErrorMsg}
      />

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={status === 'saving'}
          className="px-3 py-1.5 text-sm rounded bg-zinc-700 hover:bg-zinc-600 text-white transition-colors disabled:opacity-50"
        >
          {status === 'saving' ? 'Saving…' : 'Save background'}
        </button>
        {status === 'saved' && <span className="text-xs text-green-400">Saved</span>}
        {status === 'error' && <span className="text-xs text-red-400">{errorMsg ?? 'Error'}</span>}
        {errorMsg && status !== 'error' && <span className="text-xs text-red-400">{errorMsg}</span>}
      </div>
    </div>
  )
}
