import './styles.css'
import type { SectionDividerSlotProps } from '@/lib/types'

export default function NeuroklastClassicSectionDivider({ className }: SectionDividerSlotProps) {
  return (
    <div className={`theme-divider w-full ${className ?? ''}`} aria-hidden="true">
      <span className="theme-divider-data">01001110 4B 2077</span>
    </div>
  )
}
NeuroklastClassicSectionDivider.displayName = 'NeuroklastClassicSectionDivider'
