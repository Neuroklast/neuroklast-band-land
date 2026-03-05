import './styles.css'
import type { CardSlotProps } from '@/lib/types'
export default function VhsRetroCard({ children, className }: CardSlotProps) {
  return <div className={`theme-card p-4 ${className ?? ''}`}>{children}</div>
}
VhsRetroCard.displayName = 'VhsRetroCard'
