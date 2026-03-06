import './styles.css'
import type { SectionDividerSlotProps } from '@/lib/types'

export default function ZardonicSectionDivider({ className }: SectionDividerSlotProps) {
  return (
    <div className={`zardonic-divider w-full my-8 ${className ?? ''}`} aria-hidden="true">
      <div className="zardonic-divider-line-left" />
      <div className="zardonic-divider-center">
        <div className="zardonic-divider-square" />
        <span className="zardonic-divider-label">SYS.DIVIDE</span>
        <div className="zardonic-divider-square" />
      </div>
      <div className="zardonic-divider-line-right" />
    </div>
  )
}

ZardonicSectionDivider.displayName = 'ZardonicSectionDivider'
