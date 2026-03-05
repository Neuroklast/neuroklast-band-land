import './styles.css'
import type { CardSlotProps } from '@/lib/types'

const CODE_CHARS = '01010110 10110101 00101101 11010010'

export default function NeuroklastClassicCard({ children, className }: CardSlotProps) {
  return (
    <div className={`theme-card p-4 ${className ?? ''}`}>
      <div className="theme-card-code-overlay" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="theme-card-code-col"
            style={{ animationDelay: `${i * 0.3}s`, animationDuration: `${2 + i * 0.4}s` }}
          >
            {CODE_CHARS}
          </div>
        ))}
      </div>
      {children}
    </div>
  )
}
NeuroklastClassicCard.displayName = 'NeuroklastClassicCard'
