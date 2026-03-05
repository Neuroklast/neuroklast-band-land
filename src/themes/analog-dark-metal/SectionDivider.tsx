import './styles.css'
import type { SectionDividerSlotProps } from '@/lib/types'
export default function AnalogDarkMetalSectionDivider({ className }: SectionDividerSlotProps) {
  return (
    <div className={`theme-divider w-full ${className ?? ''}`} aria-hidden="true">
      <div className="theme-divider-line" />
      <span className="theme-divider-symbol">✕</span>
      <div className="theme-divider-line" />
    </div>
  )
}
AnalogDarkMetalSectionDivider.displayName = 'AnalogDarkMetalSectionDivider'
