'use client'

import { MediaSourcePicker } from '@/app/admin/_components/MediaSourcePicker'
import { DEFAULT_HERO_LOGO_URL } from '@/lib/hero-defaults'
import * as SliderPrimitive from '@radix-ui/react-slider'

export interface HeroWordmarkControlsProps {
  logoImageUrl: string
  logoImageStoragePath: string
  logoWidthPercent: number
  logoWidthPercentMobile: number
  onLogoResolved: (path: string, publicUrl?: string) => void
  onResetLogo: () => void
  onDesktopWidthChange: (value: number) => void
  onMobileWidthChange: (value: number) => void
  onError: (message: string) => void
}

/** Controlled media selection and width previews; the parent owns draft and saving. */
export function HeroWordmarkControls({
  logoImageUrl,
  logoImageStoragePath,
  logoWidthPercent,
  logoWidthPercentMobile,
  onLogoResolved,
  onResetLogo,
  onDesktopWidthChange,
  onMobileWidthChange,
  onError,
}: HeroWordmarkControlsProps) {
  const resolvedLogoPreview = logoImageUrl || DEFAULT_HERO_LOGO_URL

  return (
    <>
        <MediaSourcePicker
          label="Hero Wordmark Image"
          currentUrl={logoImageUrl || DEFAULT_HERO_LOGO_URL}
          currentStoragePath={logoImageStoragePath || null}
          storagePrefix="hero/logo"
          editorFitMode="contain"
          maxOutputDimension={4096}
          onResolved={onLogoResolved}
          onError={onError}
        />
        <p className="text-xs text-zinc-500">
          PNG or WebP with transparency works best. Upload a large source (ideally ≥2000px wide) for sharp
          display at high width %. Exports keep up to 4096px. If the logo looks pixelated, re-upload after a
          crop-export fix so the file is full resolution (not the editor preview size). Leave empty for the
          default Neuroklast wordmark.
        </p>
        {logoImageUrl ? (
          <button
            type="button"
            onClick={onResetLogo}
            className="text-xs text-zinc-500 hover:text-zinc-300 underline"
          >
            Reset to default wordmark
          </button>
        ) : null}

        <div className="space-y-4 pt-1">
          <p className="text-xs text-zinc-500">
            Width as % of the content column (page margins only). Height scales with the image aspect
            ratio — no max-height. Desktop and mobile are separate: one value cannot look right on both.
          </p>

          <div className="space-y-2">
            <label className="block text-xs text-zinc-400 font-semibold uppercase tracking-widest">
              Desktop width:{' '}
              <span className="text-zinc-300 font-mono">{logoWidthPercent}%</span>
              <span className="text-zinc-600 font-normal normal-case tracking-normal ml-1">
                (md and up)
              </span>
            </label>
            <SliderPrimitive.Root
              min={15}
              max={100}
              step={1}
              value={[logoWidthPercent]}
              onValueChange={([v]) => onDesktopWidthChange(v)}
              className="relative flex items-center w-full touch-none select-none h-5"
              aria-label="Hero wordmark desktop width percent"
            >
              <SliderPrimitive.Track className="relative h-1 grow rounded-full bg-zinc-700">
                <SliderPrimitive.Range className="absolute h-full rounded-full bg-red-500" />
              </SliderPrimitive.Track>
              <SliderPrimitive.Thumb className="block size-4 rounded-full border border-red-500 bg-zinc-900 shadow focus:outline-none cursor-grab" />
            </SliderPrimitive.Root>
          </div>

          <div className="space-y-2">
            <label className="block text-xs text-zinc-400 font-semibold uppercase tracking-widest">
              Mobile width:{' '}
              <span className="text-zinc-300 font-mono">{logoWidthPercentMobile}%</span>
              <span className="text-zinc-600 font-normal normal-case tracking-normal ml-1">
                (phones)
              </span>
            </label>
            <SliderPrimitive.Root
              min={15}
              max={100}
              step={1}
              value={[logoWidthPercentMobile]}
              onValueChange={([v]) => onMobileWidthChange(v)}
              className="relative flex items-center w-full touch-none select-none h-5"
              aria-label="Hero wordmark mobile width percent"
            >
              <SliderPrimitive.Track className="relative h-1 grow rounded-full bg-zinc-700">
                <SliderPrimitive.Range className="absolute h-full rounded-full bg-red-500" />
              </SliderPrimitive.Track>
              <SliderPrimitive.Thumb className="block size-4 rounded-full border border-red-500 bg-zinc-900 shadow focus:outline-none cursor-grab" />
            </SliderPrimitive.Root>
            <p className="text-xs text-zinc-500">
              Phones are a narrow column — 85–100% usually matches the old full-width wordmark feel.
              Desktop can stay lower (e.g. 55–70%) without shrinking mobile.
            </p>
          </div>

          {/* Live previews: desktop + mobile % of their preview rails */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">Desktop preview</p>
              <div className="flex justify-center rounded border border-zinc-800 bg-zinc-950/80 p-4">
                <div className="flex w-full items-center justify-center">
                  <img
                    src={resolvedLogoPreview}
                    alt=""
                    className="h-auto object-contain brightness-110"
                    style={{ width: `${logoWidthPercent}%`, maxWidth: '100%' }}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">Mobile preview</p>
              <div className="mx-auto flex max-w-[14rem] justify-center rounded border border-zinc-800 bg-zinc-950/80 p-3">
                <div className="flex w-full items-center justify-center">
                  <img
                    src={resolvedLogoPreview}
                    alt=""
                    className="h-auto object-contain brightness-110"
                    style={{ width: `${logoWidthPercentMobile}%`, maxWidth: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
    </>
  )
}
