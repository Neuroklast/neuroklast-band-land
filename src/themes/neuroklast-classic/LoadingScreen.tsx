import './styles.css'
import { useEffect, useState, useRef } from 'react'
import type { LoadingScreenSlotProps } from '@/lib/types'

const CODE_CHARS = '01アイウエオNEUROKLAST'

export default function NeuroklastClassicLoadingScreen({ onComplete }: LoadingScreenSlotProps) {
  const [progress, setProgress] = useState(0)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); return 100 }
        return Math.min(prev + 2, 100)
      })
    }, 50)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => onCompleteRef.current(), 600)
      return () => clearTimeout(t)
    }
  }, [progress])

  const cols = Array.from({ length: 20 }, (_, i) => ({
    chars: Array.from({ length: 40 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join(''),
    dur: `${3 + (i % 5) * 0.7}s`,
    delay: `${(i * 0.2) % 2}s`,
  }))

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background overflow-hidden">
      <div className="theme-bg-code-rain absolute inset-0">
        {cols.map((col, i) => (
          <div key={i} className="theme-bg-code-col" style={{ animationDuration: col.dur, animationDelay: col.delay, opacity: 0.08 }}>
            {col.chars}
          </div>
        ))}
      </div>
      <div className="theme-bg-overlay absolute inset-0" />
      <div className="relative z-10 flex flex-col items-center gap-6 px-8 w-full max-w-sm">
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.25rem', letterSpacing: '0.2em', color: 'var(--primary)', animation: 'nk-hud-pulse 2s ease infinite' }}>
          NEUROKLAST.SYS
        </div>
        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: 'var(--primary)', opacity: 0.7 }}>
          {Math.floor(progress)}%
        </div>
      </div>
    </div>
  )
}
NeuroklastClassicLoadingScreen.displayName = 'NeuroklastClassicLoadingScreen'
