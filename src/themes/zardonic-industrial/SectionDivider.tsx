import './styles.css'
import type { SectionDividerSlotProps } from '@/lib/types'
export default function ZardonicSectionDivider({ className }: SectionDividerSlotProps) {
  return <div className={`theme-divider w-full ${className ?? ''}`} aria-hidden="true" />
}
ZardonicSectionDivider.displayName = 'ZardonicSectionDivider'
