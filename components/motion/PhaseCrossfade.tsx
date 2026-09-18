import type { ReactNode } from 'react'

export function PhaseCrossfade({
  progress,
  outgoing,
  incoming,
  className,
  holdIncoming = false,
}: {
  progress: number
  outgoing: ReactNode
  incoming: ReactNode
  className?: string
  holdIncoming?: boolean
}) {
  const t = Math.min(1, Math.max(0, progress))
  const outgoingInert = t > 0.45
  const incomingInert = t < 0.55
  return (
    <div className={`grid w-full grid-cols-1 grid-rows-1 ${className ?? ''}`}>
      {t < 1 ? (
        <div
          className="col-start-1 row-start-1 min-h-0 min-w-0"
          aria-hidden={outgoingInert}
          {...(outgoingInert ? { inert: true } : {})}
          style={{
            opacity: 1 - t,
            clipPath: `inset(0 0 0 ${t * 50}%)`,
            pointerEvents: outgoingInert ? 'none' : 'auto',
          }}
        >
          {outgoing}
        </div>
      ) : null}
      {t > 0 || holdIncoming ? (
        <div
          className="col-start-1 row-start-1 min-h-0 min-w-0"
          aria-hidden={incomingInert}
          {...(incomingInert ? { inert: true } : {})}
          style={{
            opacity: t,
            clipPath: `inset(0 ${(1 - t) * 50}% 0 0)`,
          }}
        >
          {incoming}
        </div>
      ) : null}
    </div>
  )
}
