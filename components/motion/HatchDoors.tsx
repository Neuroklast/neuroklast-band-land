export function HatchDoors({
  progress,
  active = false,
}: {
  progress: number
  active?: boolean
}) {
  const open = Math.min(1, Math.max(0, progress))
  if (!active || open >= 1) return null
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-y-0 left-0 w-1/2 border-r border-primary/35 bg-black"
        style={{ transform: `translate3d(${-open * 100}%, 0, 0)` }}
      />
      <div
        className="absolute inset-y-0 right-0 w-1/2 border-l border-primary/35 bg-black"
        style={{ transform: `translate3d(${open * 100}%, 0, 0)` }}
      />
    </div>
  )
}
