import './styles.css'
import type { BackgroundEffectsSlotProps } from '@/lib/types'

const PARTICLE_COUNT = 10

// Deterministic particle distribution: prime-based offsets ensure visual spread
// without random values (SSR-safe). 11/7/97 spread particles across 0–96% of width.
const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  left: `${(i * 11 + 7) % 97}%`,
  animationDelay: `${(i * 1.3) % 6}s`,
  animationDuration: `${8 + (i * 0.7) % 6}s`,
  size: `${3 + (i * 1.1) % 5}px`,
}))

export default function CyberpunkBackgroundEffects({ className }: BackgroundEffectsSlotProps) {
  return (
    <>
      {/* Perspective grid */}
      <div className={`cyberpunk-perspective-grid ${className ?? ''}`} aria-hidden="true" />
      {/* Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        {particles.map((p) => (
          <div
            key={p.id}
            className="cyberpunk-particle"
            style={{
              left: p.left,
              bottom: '0',
              width: p.size,
              height: p.size,
              animationDelay: p.animationDelay,
              animationDuration: p.animationDuration,
            }}
          />
        ))}
      </div>
      {/* Ambient glow */}
      <div className="cyberpunk-ambient-glow" aria-hidden="true" />
    </>
  )
}

CyberpunkBackgroundEffects.displayName = 'CyberpunkBackgroundEffects'
