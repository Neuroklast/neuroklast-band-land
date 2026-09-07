'use client'

import './styles.css'
import type { BackgroundEffectsSlotProps } from '@/lib/types'

const GLITCH_BLOCKS = [0, 1, 2, 3, 4]

export default function NeuroklastClassicBackgroundEffects({ className }: BackgroundEffectsSlotProps) {
  return (
    <div className={`theme-bg ${className ?? ''}`} aria-hidden="true">
      <div className="theme-bg-overlay" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" style={{ contain: 'layout' }}>
        <div className="absolute inset-0 hud-grid-overlay" />

        <svg className="absolute inset-0 w-full h-full opacity-[0.07] text-primary" preserveAspectRatio="none">
          <defs>
            <linearGradient id="nk-circuit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
              <stop offset="40%" stopColor="currentColor" stopOpacity="0.8" />
              <stop offset="60%" stopColor="currentColor" stopOpacity="0.8" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M 0 200 L 150 200 L 180 170 L 350 170 L 380 200 L 500 200" stroke="url(#nk-circuit-grad)" strokeWidth="1" fill="none" className="cyberpunk-circuit-trace" />
          <path d="M 600 400 L 750 400 L 780 370 L 950 370 L 980 340 L 1100 340" stroke="url(#nk-circuit-grad)" strokeWidth="1" fill="none" className="cyberpunk-circuit-trace" style={{ animationDelay: '2s' }} />
          <path d="M 200 600 L 350 600 L 380 570 L 550 570 L 580 600 L 700 600" stroke="url(#nk-circuit-grad)" strokeWidth="1" fill="none" className="cyberpunk-circuit-trace" style={{ animationDelay: '4s' }} />
        </svg>

        {GLITCH_BLOCKS.map((i) => (
          <div
            key={`nk-glitch-${i}`}
            className="absolute cyberpunk-glitch-block"
            style={{
              top: `${10 + i * 18}%`,
              left: `${5 + (i % 3) * 35}%`,
              width: `${40 + i * 15}px`,
              height: `${3 + (i % 2)}px`,
              animationDelay: `${i * 1.7}s`,
              animationDuration: `${6 + i * 1.5}s`,
            }}
          />
        ))}

        <svg className="absolute inset-0 w-full h-full opacity-[0.04] text-primary" preserveAspectRatio="none">
          <defs>
            <pattern id="nk-hex-pattern" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
              <polygon points="30,2 56,15 56,37 30,50 4,37 4,15" stroke="currentColor" strokeWidth="0.5" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#nk-hex-pattern)" className="cyberpunk-hex-fade" />
        </svg>

        <svg className="absolute inset-0 w-full h-full opacity-5 text-primary" preserveAspectRatio="none">
          <defs>
            <pattern id="nk-hud-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#nk-hud-dots)" />
        </svg>
      </div>
    </div>
  )
}
NeuroklastClassicBackgroundEffects.displayName = 'NeuroklastClassicBackgroundEffects'
