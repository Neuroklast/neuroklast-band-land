import './styles.css'
import type { SectionDividerSlotProps } from '@/lib/types'
export default function AnalogDarkMetalSectionDivider({ className }: SectionDividerSlotProps) {
  return (
    <div className={`theme-divider w-full ${className ?? ''}`} aria-hidden="true">
      <div className="theme-divider-pipe" />
      <span className="theme-divider-pulse" />
      <div className="theme-divider-pipe" />
    </div>
  )
}
AnalogDarkMetalSectionDivider.displayName = 'AnalogDarkMetalSectionDivider'
