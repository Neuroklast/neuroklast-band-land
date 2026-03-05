import './styles.css'
import type { SectionDividerSlotProps } from '@/lib/types'
export default function ArtDecoCyberpunkSectionDivider({ className }: SectionDividerSlotProps) {
  return (
    <div className={`theme-divider w-full ${className ?? ''}`} aria-hidden="true">
      <div className="theme-divider-line" />
      <span className="theme-divider-ornament">❖</span>
      <div className="theme-divider-line" />
    </div>
  )
}
ArtDecoCyberpunkSectionDivider.displayName = 'ArtDecoCyberpunkSectionDivider'
