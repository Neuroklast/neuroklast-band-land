'use client'

import { useCallback, useState, type CSSProperties } from 'react'
import { useReducedMotion } from 'framer-motion'
import { LatchRail } from '@/components/motion/LatchRail'
import { useLocale } from '@/contexts/LocaleContext'

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
  const { t } = useLocale()
  const reducedMotion = useReducedMotion() === true
  const [granted, setGranted] = useState(false)

  const consent = useCallback(() => {
    if (granted) return
    setGranted(true)
    onConsent()
  }, [granted, onConsent])

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 bg-black/40 border border-primary/20 px-4 py-6 rounded-none ${className ?? ''}`}
      style={style}
    >
      <LatchRail
        compact
        reducedMotion={reducedMotion}
        granted={granted}
        onGranted={consent}
        ariaLabel={t('embed.jackInAria')}
        label={t('embed.jackIn')}
        grantedLabel={title}
      />
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
        className="font-mono text-sm uppercase tracking-wider text-muted-foreground hover:text-primary"
      >
        {title}
      </button>
      <p className="text-xs font-mono text-muted-foreground/70 text-center max-w-xs leading-relaxed">{hint}</p>
    </div>
  )
}
