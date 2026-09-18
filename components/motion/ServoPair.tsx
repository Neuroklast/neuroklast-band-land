import type { ReactNode } from 'react'

export function ServoPair({
  progress,
  leftGain = 1.1,
  rightGain = 0.92,
  heightClass = 'h-16',
  children,
}: {
  progress: number
  leftGain?: number
  rightGain?: number
  heightClass?: string
  children: ReactNode
}) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100)
  return (
    <div className="flex w-full items-end gap-3">
      <div className={`flex ${heightClass} w-2 flex-col justify-end overflow-hidden bg-primary/15`} aria-hidden>
        <div className="w-full origin-bottom bg-primary" style={{ height: `${Math.min(100, pct * leftGain)}%` }} />
      </div>
      <div className="min-w-0 flex-1">{children}</div>
      <div className={`flex ${heightClass} w-2 flex-col justify-end overflow-hidden bg-primary/15`} aria-hidden>
        <div className="w-full origin-bottom bg-primary" style={{ height: `${Math.min(100, pct * rightGain)}%` }} />
      </div>
    </div>
  )
}
