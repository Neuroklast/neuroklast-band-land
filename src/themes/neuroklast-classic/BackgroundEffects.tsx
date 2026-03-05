import './styles.css'
import type { BackgroundEffectsSlotProps } from '@/lib/types'

const CODE_CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ'
const COLS = 20
const codeColumns = Array.from({ length: COLS }, (_, i) => ({
  chars: Array.from({ length: 30 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join(''),
  duration: `${4 + (i % 7) * 0.8}s`,
  delay: `${(i * 0.3) % 3}s`,
}))

export default function NeuroklastClassicBackgroundEffects({ className }: BackgroundEffectsSlotProps) {
  return (
    <div className={`theme-bg ${className ?? ''}`} aria-hidden="true">
      <div className="theme-bg-code-rain">
        {codeColumns.map((col, i) => (
          <div
            key={i}
            className="theme-bg-code-col"
            style={{ animationDuration: col.duration, animationDelay: col.delay }}
          >
            {col.chars}
          </div>
        ))}
      </div>
      <div className="theme-bg-overlay" />
    </div>
  )
}
NeuroklastClassicBackgroundEffects.displayName = 'NeuroklastClassicBackgroundEffects'
