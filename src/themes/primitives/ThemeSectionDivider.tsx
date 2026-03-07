/**
 * Unified SectionDivider primitive — ONE component for all themes.
 *
 * Visual differences are driven entirely by CSS custom properties and
 * `[data-theme]` selectors. The markup includes structural elements
 * (lines, center ornament, label) that are selectively styled per theme.
 */

import type { SectionDividerSlotProps } from '@/lib/types'

export default function ThemeSectionDivider({ className }: SectionDividerSlotProps) {
  return (
    <div className={className ? `theme-divider ${className}` : 'theme-divider'} aria-hidden="true">
      <div className="theme-divider-line theme-divider-line-left" />
      <span className="theme-divider-center" />
      <div className="theme-divider-line theme-divider-line-right" />
    </div>
  )
}

ThemeSectionDivider.displayName = 'ThemeSectionDivider'
