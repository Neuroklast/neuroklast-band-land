import './styles.css'
import type { CardSlotProps } from '@/lib/types'
export default function AnalogDarkMetalCard({ children, className }: CardSlotProps) {
  return <div className={`theme-card p-4 ${className ?? ''}`}>{children}</div>
}
AnalogDarkMetalCard.displayName = 'AnalogDarkMetalCard'
