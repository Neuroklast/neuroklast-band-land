import './styles.css'
import type { SectionDividerSlotProps } from '@/lib/types'
export default function RetroSectionDivider({ className }: SectionDividerSlotProps) {
  return (
    <div className={`theme-divider ${className ?? ''}`} aria-hidden="true">
      {'─'.repeat(48)}
    </div>
  )
}
RetroSectionDivider.displayName = 'RetroSectionDivider'
