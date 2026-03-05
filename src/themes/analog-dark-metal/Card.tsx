import './styles.css'
import type { CardSlotProps } from '@/lib/types'
export default function AnalogDarkMetalCard({ children, className }: CardSlotProps) {
  return (
    <div className={`theme-card p-4 ${className ?? ''}`}>
      <div className="theme-card-bolt theme-card-bolt-tl" aria-hidden="true" />
      <div className="theme-card-bolt theme-card-bolt-tr" aria-hidden="true" />
      <div className="theme-card-bolt theme-card-bolt-bl" aria-hidden="true" />
      <div className="theme-card-bolt theme-card-bolt-br" aria-hidden="true" />
      {children}
    </div>
  )
}
AnalogDarkMetalCard.displayName = 'AnalogDarkMetalCard'
