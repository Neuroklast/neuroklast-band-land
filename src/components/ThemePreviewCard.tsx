/**
 * ThemePreviewCard — CSS-generated mini preview of a design preset.
 *
 * Displays the preset's colors, fonts, and border-radius as a small
 * visual card without requiring any static images.
 */
import type React from 'react'
import type { DesignPreset } from '@/lib/types'
import { useLocale } from '@/hooks/use-locale'

interface ThemePreviewCardProps {
  preset: DesignPreset
  active?: boolean
  className?: string
}

export default function ThemePreviewCard({ preset, active, className = '' }: ThemePreviewCardProps) {
  const { t } = useLocale()
  const { colors, fonts, borderRadius } = preset
  const radiusPx = Math.round((borderRadius ?? 0.125) * 16)

  return (
    <div
      className={`w-full overflow-hidden border-2 transition-all ${
        active ? 'ring-2 ring-offset-1' : ''
      } ${className}`}
      style={{
        background: colors.background,
        borderColor: active ? colors.primary : `color-mix(in oklch, ${colors.primary} 30%, transparent)`,
        borderRadius: `${radiusPx}px`,
        ...({ '--tw-ring-color': colors.primary } as React.CSSProperties),
      }}
      aria-label={`Theme preview: ${preset.name}`}
    >
      {/* Header bar */}
      <div
        className="px-2 py-1 flex items-center gap-1"
        style={{ background: colors.card }}
      >
        {/* Dot indicators */}
        <span className="block w-2 h-2 rounded-full" style={{ background: colors.primary }} />
        <span className="block w-2 h-2 rounded-full" style={{ background: colors.accent }} />
        <span className="block w-2 h-2 rounded-full opacity-40" style={{ background: colors.border }} />
        <span
          className="ml-auto text-[8px] truncate"
          style={{
            color: colors.foreground,
            fontFamily: fonts.heading,
            opacity: 0.8,
          }}
        >
          {preset.name}
        </span>
      </div>

      {/* Body */}
      <div className="p-2 space-y-1.5">
        {/* Fake heading */}
        <div
          className="text-[9px] font-bold tracking-widest"
          style={{ color: colors.primary, fontFamily: fonts.heading }}
        >
          NEUROKLAST
        </div>

        {/* Fake body text */}
        <div
          className="text-[8px] opacity-70 leading-tight"
          style={{ color: colors.mutedForeground, fontFamily: fonts.body }}
        >
          {t('themePreview.genre')}
        </div>

        {/* Color swatches */}
        <div className="flex gap-1 mt-1">
          {[colors.primary, colors.accent, colors.card, colors.border].map((c, i) => (
            <span
              key={i}
              className="block h-2 flex-1"
              style={{
                background: c,
                borderRadius: `${Math.min(radiusPx, 2)}px`,
              }}
            />
          ))}
        </div>

        {/* Font label */}
        <div
          className="text-[7px] opacity-50 truncate"
          style={{ color: colors.foreground, fontFamily: fonts.mono ?? fonts.body }}
        >
          {fonts.heading.replace(/['"]/g, '').split(',')[0].trim()}
        </div>
      </div>
    </div>
  )
}
