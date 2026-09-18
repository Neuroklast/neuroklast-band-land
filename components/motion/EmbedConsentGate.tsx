'use client'

import { useCallback, useState, type CSSProperties } from 'react'
import { Play } from '@phosphor-icons/react'

export function EmbedConsentGate({
  ariaLabel,
  title,
  hint,
  className,
  style,
  onConsent,
}: {
  ariaLabel: string
  title: string
  hint: string
  className?: string
  style?: CSSProperties
  onConsent: () => void
}) {
  const [granted, setGranted] = useState(false)

  const consent = useCallback(() => {
    if (granted) return
    setGranted(true)
    onConsent()
  }, [granted, onConsent])

  return (
    <button
      type="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={consent}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          consent()
        }
      }}
      className={`group relative flex h-full w-full cursor-pointer flex-col items-center justify-center gap-3 border border-primary/30 bg-black/40 px-4 py-6 outline-none transition-colors hover:border-primary/60 hover:bg-black/30 focus-visible:border-primary ${className ?? ''}`}
      style={style}
    >
      <span className="pointer-events-none absolute top-2 left-2 h-2 w-2 border-t border-l border-primary/50" aria-hidden />
      <span className="pointer-events-none absolute top-2 right-2 h-2 w-2 border-t border-r border-primary/50" aria-hidden />
      <span className="pointer-events-none absolute bottom-2 left-2 h-2 w-2 border-b border-l border-primary/50" aria-hidden />
      <span className="pointer-events-none absolute bottom-2 right-2 h-2 w-2 border-b border-r border-primary/50" aria-hidden />
      <span
        className="pointer-events-none absolute inset-x-6 top-[18%] h-px bg-primary/25 opacity-40 group-hover:opacity-80"
        aria-hidden
      />
      <span className="flex size-16 items-center justify-center rounded-full border border-primary/35 bg-primary/15 group-hover:bg-primary/25">
        <Play size={28} weight="fill" className="text-primary ml-0.5" />
      </span>
      <span className="font-mono text-sm uppercase tracking-[0.2em] text-primary">{title}</span>
      <span className="max-w-xs text-center font-mono text-xs leading-relaxed text-muted-foreground/70">{hint}</span>
    </button>
  )
}
