'use client'

import { useCallback, useState, type CSSProperties } from 'react'
import { Play } from '@phosphor-icons/react'

export function EmbedConsentGate({
  ariaLabel,
  title,
  hint,
  compact = false,
  className,
  style,
  onConsent,
}: {
  ariaLabel: string
  title: string
  hint: string
  compact?: boolean
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
      className={`group relative flex h-full w-full cursor-pointer flex-col items-center justify-center border border-primary/30 bg-black/40 outline-none transition-colors hover:border-primary/60 hover:bg-black/30 focus-visible:border-primary ${compact ? 'gap-2 px-4 py-2' : 'gap-3 px-4 py-6'} ${className ?? ''}`}
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
      <span className={`flex items-center justify-center rounded-full border border-primary/35 bg-primary/15 group-hover:bg-primary/25 ${compact ? 'size-9' : 'size-16'}`}>
        <Play size={compact ? 18 : 28} weight="fill" className="text-primary ml-0.5" />
      </span>
      <span className={`font-mono uppercase text-primary ${compact ? 'text-xs tracking-[0.12em]' : 'text-sm tracking-[0.2em]'}`}>{title}</span>
      <span className={`text-center font-mono text-muted-foreground/70 ${compact ? 'max-w-md text-[11px] leading-snug' : 'max-w-xs text-xs leading-relaxed'}`}>{hint}</span>
    </button>
  )
}
