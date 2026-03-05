import './styles.css'
import type { CardSlotProps } from '@/lib/types'
export default function ElegantCard({ children, className }: CardSlotProps) {
  return <div className={`theme-card p-4 ${className ?? ''}`}>{children}</div>
}
ElegantCard.displayName = 'ElegantCard'
