/**
 * Unified Card primitive — ONE component for all themes.
 *
 * Visual differences are driven entirely by CSS custom properties and
 * `[data-theme]` selectors. The markup includes structural elements
 * (corners, overlay, code-rain columns) that are hidden by default and
 * selectively activated per theme in `theme-slots.css`.
 */

import type { CardSlotProps } from '@/lib/types'

const CODE_CHARS = '01010110 10110101 00101101 11010010'

const CODE_COLS = Array.from({ length: 6 }, (_, i) => ({
  key: i,
  animationDelay: `${i * 0.3}s`,
  animationDuration: `${2 + i * 0.4}s`,
}))

export default function ThemeCard({ children, className }: CardSlotProps) {
  return (
    <div className={`theme-card ${className ?? ''}`}>
      <div className="theme-card-content">
        {/* Corner decorations — activated per-theme via CSS */}
        <div className="theme-card-corner theme-card-corner-tl" aria-hidden="true" />
        <div className="theme-card-corner theme-card-corner-tr" aria-hidden="true" />
        <div className="theme-card-corner theme-card-corner-bl" aria-hidden="true" />
        <div className="theme-card-corner theme-card-corner-br" aria-hidden="true" />

        {/* Scanline / noise overlay — activated per-theme via CSS */}
        <div className="theme-card-overlay" aria-hidden="true" />

        {/* Code-rain overlay for neuroklast-classic */}
        <div className="theme-card-code-overlay" aria-hidden="true">
          {CODE_COLS.map(({ key, animationDelay, animationDuration }) => (
            <div
              key={key}
              className="theme-card-code-col"
              style={{ animationDelay, animationDuration }}
            >
              {CODE_CHARS}
            </div>
          ))}
        </div>

        {children}
      </div>
    </div>
  )
}

ThemeCard.displayName = 'ThemeCard'
