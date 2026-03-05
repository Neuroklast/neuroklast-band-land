import './styles.css'
import type { CardSlotProps } from '@/lib/types'
export default function SteampunkCard({ children, className }: CardSlotProps) {
  return (
    <div className={`theme-card p-4 ${className ?? ''}`}>
      <div className="theme-card-rivet theme-card-rivet-tl" aria-hidden="true" />
      <div className="theme-card-rivet theme-card-rivet-tr" aria-hidden="true" />
      <div className="theme-card-rivet theme-card-rivet-bl" aria-hidden="true" />
      <div className="theme-card-rivet theme-card-rivet-br" aria-hidden="true" />
      {children}
    </div>
  )
}
SteampunkCard.displayName = 'SteampunkCard'
