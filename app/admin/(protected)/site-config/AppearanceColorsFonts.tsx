'use client'

import { AdminAccordion } from '@/app/admin/_components/AdminAccordion'
import { MediaSourcePicker } from '@/app/admin/_components/MediaSourcePicker'
import {
  BODY_FONT_OPTIONS,
  FONT_SIZE_RANGES,
  formatFontSizeRem,
  HEADING_FONT_OPTIONS,
  MONO_FONT_OPTIONS,
  parseFontSizeRem,
  type AppearanceTheme,
} from '@/lib/appearance-presets'
import { hexToOklch, oklchToHex } from '@/lib/color-utils'
import * as SliderPrimitive from '@radix-ui/react-slider'

const THEME_COLOR_FIELDS: Array<{ key: keyof AppearanceTheme; label: string; hint: string }> = [
  { key: 'foregroundColor', label: 'Headings & primary text', hint: 'Section titles, card titles, links' },
  { key: 'mutedForegroundColor', label: 'Body & secondary text', hint: 'Paragraphs, dates, subtitles' },
  { key: 'backgroundColor', label: 'Page background', hint: 'Behind everything' },
  { key: 'cardColor', label: 'Panel color', hint: 'Base color for sections & cards' },
  { key: 'accentColor', label: 'Accent', hint: 'Highlights and glow' },
  { key: 'primaryColor', label: 'Links & buttons', hint: 'Interactive elements' },
  { key: 'borderColor', label: 'Borders', hint: 'Lines and dividers' },
  { key: 'modalGlowColor', label: 'Modal glow', hint: 'Event / overlay edge glow' },
]


export interface AppearanceColorsFontsProps {
  theme: AppearanceTheme
  onThemeFieldChange: (key: keyof AppearanceTheme, value: string) => void
  faviconUrl: string
  faviconStoragePath: string
  onFaviconStoragePathChange: (value: string) => void
  onFaviconUrlChange: (value: string) => void
  onError: (message: string | null) => void
}

/** Controlled fields only: persistence and draft broadcasts belong to AppearanceEditor. */
export function AppearanceColorsFonts({
  theme, onThemeFieldChange, faviconUrl, faviconStoragePath,
  onFaviconStoragePathChange, onFaviconUrlChange, onError,
}: AppearanceColorsFontsProps) {
  return (
      <AdminAccordion title="Colors & fonts" description="Fine-tune palette, typography and favicon">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {THEME_COLOR_FIELDS.map(({ key, label, hint }) => {
            const value = theme[key] ?? ''
            const hex = value
              ? value.startsWith('#')
                ? value.slice(0, 7)
                : oklchToHex(value)
              : '#000000'
            const safeHex = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#000000'
            return (
              <div key={key} className="space-y-1">
                <label className="text-xs text-zinc-400">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={safeHex}
                    onChange={(e) => onThemeFieldChange(key, hexToOklch(e.target.value))}
                    className="h-8 w-10 cursor-pointer rounded border border-zinc-700 bg-transparent"
                    aria-label={`${label} color`}
                  />
                  <input
                    type="text"
                    value={safeHex.toUpperCase()}
                    onChange={(e) => {
                      const next = e.target.value.trim()
                      if (/^#[0-9a-fA-F]{6}$/.test(next)) {
                        onThemeFieldChange(key, hexToOklch(next))
                      }
                    }}
                    className="w-24 rounded border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-xs uppercase text-zinc-300"
                    aria-label={`${label} hex`}
                  />
                  <span className="text-xs text-zinc-500">{hint}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-zinc-800">
          {[
            { label: 'Heading font', key: 'fontHeading' as const, options: HEADING_FONT_OPTIONS },
            { label: 'Body font', key: 'fontBody' as const, options: BODY_FONT_OPTIONS },
            { label: 'Mono font', key: 'fontMono' as const, options: MONO_FONT_OPTIONS },
          ].map(({ label, key, options }) => {
            const current = theme[key] ?? ''
            const hasCurrent = !current || options.some((opt) => opt.value === current)
            return (
              <div key={key} className="space-y-1">
                <label className="text-xs text-zinc-400">{label}</label>
                <select
                  value={current}
                  onChange={(e) => onThemeFieldChange(key, e.target.value)}
                  className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded px-2 py-2 text-zinc-300"
                >
                  {!hasCurrent ? (
                    <option value={current}>Current (saved)</option>
                  ) : null}
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>

        <div className="space-y-4 pt-2 border-t border-zinc-800">
          <p className="text-xs text-zinc-500">
            Section heading size only affects large section titles — not release cards, browse pages, or other item labels.
          </p>
          {(Object.keys(FONT_SIZE_RANGES) as Array<keyof typeof FONT_SIZE_RANGES>).map((key) => {
            const range = FONT_SIZE_RANGES[key]
            const current = parseFontSizeRem(theme[range.themeKey], range.default)
            return (
              <div key={key} className="space-y-2">
                <label className="block text-xs text-zinc-400">
                  {range.label}: <span className="font-mono text-zinc-300">{formatFontSizeRem(current)}</span>
                </label>
                <SliderPrimitive.Root
                  min={range.min}
                  max={range.max}
                  step={range.step}
                  value={[current]}
                  onValueChange={([v]) => onThemeFieldChange(range.themeKey, formatFontSizeRem(v))}
                  className="relative flex items-center w-full h-5"
                  aria-label={range.label}
                >
                  <SliderPrimitive.Track className="relative h-1 grow rounded-full bg-zinc-700">
                    <SliderPrimitive.Range className="absolute h-full rounded-full bg-red-500" />
                  </SliderPrimitive.Track>
                  <SliderPrimitive.Thumb className="block size-4 rounded-full border border-red-500 bg-zinc-900" />
                </SliderPrimitive.Root>
              </div>
            )
          })}
        </div>

        <MediaSourcePicker
          label="Favicon"
          currentUrl={faviconUrl || null}
          currentStoragePath={faviconStoragePath || null}
          storagePrefix="site/favicon"
          accept=".ico,.png,.svg,image/x-icon,image/png,image/svg+xml"
          editorAspectRatio={1}
          editorFitMode="contain"
          onResolved={(path, publicUrl) => {
            onFaviconStoragePathChange(path)
            if (publicUrl) onFaviconUrlChange(publicUrl)
            onError(null)
          }}
          onCleared={() => {
            onFaviconStoragePathChange('')
            onFaviconUrlChange('')
            onError(null)
          }}
          onError={onError}
        />
      </AdminAccordion>
  )
}
