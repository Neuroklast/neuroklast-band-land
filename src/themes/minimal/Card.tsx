import './styles.css'
import type { CardSlotProps } from '@/lib/types'
export default function MinimalCard({ children, className }: CardSlotProps) {
  return <div className={`theme-card bg-card text-card-foreground p-4 ${className ?? ''}`}>{children}</div>
}
MinimalCard.displayName = 'MinimalCard'
