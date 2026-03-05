import './styles.css'
import type { CardSlotProps } from '@/lib/types'
export default function ArtDecoCyberpunkCard({ children, className }: CardSlotProps) {
  return (
    <div className={`theme-card ${className ?? ''}`}>
      <div className="theme-card-corner theme-card-corner-tl" aria-hidden="true" />
      <div className="theme-card-corner theme-card-corner-tr" aria-hidden="true" />
      <div className="theme-card-corner theme-card-corner-bl" aria-hidden="true" />
      <div className="theme-card-corner theme-card-corner-br" aria-hidden="true" />
      {children}
    </div>
  )
}
ArtDecoCyberpunkCard.displayName = 'ArtDecoCyberpunkCard'
