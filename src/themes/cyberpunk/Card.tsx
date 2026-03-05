import './styles.css'
import type { CardSlotProps } from '@/lib/types'
export default function CyberpunkCard({ children, className }: CardSlotProps) {
  return (
    <div className={`theme-card p-4 ${className ?? ''}`}>
      <div className="theme-card-scanline" aria-hidden="true" />
      {children}
    </div>
  )
}
CyberpunkCard.displayName = 'CyberpunkCard'
