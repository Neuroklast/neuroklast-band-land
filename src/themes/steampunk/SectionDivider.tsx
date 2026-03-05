import './styles.css'
import type { SectionDividerSlotProps } from '@/lib/types'
export default function SteampunkSectionDivider({ className }: SectionDividerSlotProps) {
  return (
    <div className={`theme-divider w-full ${className ?? ''}`} aria-hidden="true">
      <div className="theme-divider-pipe" />
      <span className="theme-divider-gear">⚙</span>
      <div className="theme-divider-pipe" />
    </div>
  )
}
SteampunkSectionDivider.displayName = 'SteampunkSectionDivider'
