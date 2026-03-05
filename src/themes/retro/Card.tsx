import './styles.css'
import type { CardSlotProps } from '@/lib/types'
export default function RetroCard({ children, className }: CardSlotProps) {
  return <div className={`theme-card ${className ?? ''}`}>{children}</div>
}
RetroCard.displayName = 'RetroCard'
