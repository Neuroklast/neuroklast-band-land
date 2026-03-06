import './styles.css'
import type { CardSlotProps } from '@/lib/types'

export default function ZardonicCard({ children, className }: CardSlotProps) {
  return (
    <div
      className={`relative zardonic-crt-effect zardonic-noise-effect bg-card/80 backdrop-blur-sm border border-primary/30 p-4 overflow-hidden ${className ?? ''}`}
    >
      {/* HUD corner ornaments */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/60" aria-hidden="true" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/60" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/60" aria-hidden="true" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/60" aria-hidden="true" />
      {/* Internal scanline overlay */}
      <div className="absolute inset-0 zardonic-card-scanlines opacity-30" aria-hidden="true" />
      {children}
    </div>
  )
}

ZardonicCard.displayName = 'ZardonicCard'
