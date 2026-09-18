export function ProgressMeter({
  progress,
  className,
}: {
  progress: number
  className?: string
}) {
  const clamped = Math.min(1, Math.max(0, progress))
  const pct = Math.round(clamped * 100)
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <div className="h-0.5 flex-1 overflow-hidden bg-primary/20">
        <div className="h-full origin-left bg-primary" style={{ transform: `scaleX(${clamped})` }} />
      </div>
      <span className="font-mono text-[9px] tabular-nums tracking-widest text-primary/60">{pct}%</span>
    </div>
  )
}
