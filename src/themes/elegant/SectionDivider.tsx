import './styles.css'
import type { SectionDividerSlotProps } from '@/lib/types'
export default function ElegantSectionDivider({ className }: SectionDividerSlotProps) {
  return (
    <div className={`theme-divider w-full ${className ?? ''}`} aria-hidden="true">
      <span style={{ fontSize: '0.6rem', letterSpacing: '0.1em', opacity: 0.7 }}>◆</span>
    </div>
  )
}
ElegantSectionDivider.displayName = 'ElegantSectionDivider'
