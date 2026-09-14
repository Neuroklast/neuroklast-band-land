'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import CyberCloseButton from '@/components/CyberCloseButton'
import { TerminalFingerprintAuth } from '@/components/overlays/TerminalFingerprintAuth'
import { TerminalSliderAuth } from '@/components/overlays/TerminalSliderAuth'
import { useLenisContext } from '@/contexts/LenisContext'
import { useLocale } from '@/contexts/LocaleContext'
import { resolveAuthVariant, TERMINAL_AUTH } from '@/lib/terminal-auth-physics'
import { formatLocalAuthClock, sessionHex } from '@/lib/terminal-auth-telemetry'

type GateStatus = 'idle' | 'drop' | 'granted'

export function TerminalAuthGate({
  onUnlock,
  onDismiss,
}: {
  onUnlock: () => void
  onDismiss: () => void
}) {
  const { t } = useLocale()
  const { lenis } = useLenisContext()
  const prefersReducedMotion = useReducedMotion()
  const reducedMotion =
    prefersReducedMotion === true ||
    (typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const panelRef = useRef<HTMLDivElement>(null)
  const unlockedRef = useRef(false)
  const reactId = useId()
  const session = useMemo(() => {
    let hash = 2166136261
    for (let index = 0; index < reactId.length; index += 1) {
      hash = Math.imul(hash ^ reactId.charCodeAt(index), 16777619)
    }
    return sessionHex(hash >>> 0)
  }, [reactId])
  const [status, setStatus] = useState<GateStatus>('idle')
  const [clock, setClock] = useState('--:--:--.---')
  const [variant, setVariant] = useState<'fingerprint' | 'slider' | null>(null)

  useEffect(() => {
    setVariant(
      resolveAuthVariant({
        coarse: window.matchMedia('(pointer: coarse)').matches,
        hoverNone: window.matchMedia('(hover: none)').matches,
        narrowViewport: window.innerWidth < TERMINAL_AUTH.MOBILE_BREAKPOINT,
      }),
    )
    setClock(formatLocalAuthClock(new Date()))
    const id = window.setInterval(() => setClock(formatLocalAuthClock(new Date())), 90)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    document.documentElement.classList.add('nk-scroll-lock')
    document.body.classList.add('nk-scroll-lock')
    lenis?.stop()
    return () => {
      document.documentElement.classList.remove('nk-scroll-lock')
      document.body.classList.remove('nk-scroll-lock')
      lenis?.start()
    }
  }, [lenis])

  const finishUnlock = useCallback(() => {
    if (unlockedRef.current) return
    unlockedRef.current = true
    window.setTimeout(() => onUnlock(), reducedMotion ? 0 : TERMINAL_AUTH.GRANT_HOLD_MS)
  }, [onUnlock, reducedMotion])

  const handleGranted = useCallback(() => {
    setStatus('granted')
    finishUnlock()
  }, [finishUnlock])

  const handleDrop = useCallback(() => {
    if (unlockedRef.current) return
    setStatus('drop')
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onDismiss()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [role="slider"], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.tabIndex !== -1)
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    const focusTimer = window.setTimeout(() => {
      const control = panelRef.current?.querySelector<HTMLElement>('[role="slider"], button:not([data-overlay-close])')
      control?.focus()
    }, 40)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(focusTimer)
    }
  }, [onDismiss])

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="terminal-auth-title"
      aria-label={t('secretTerminal.authTitle')}
      className="cyberpunk-overlay-bg scanline-effect fixed inset-0 flex min-h-dvh items-center justify-center bg-black p-4 md:p-8"
      style={{ zIndex: 'var(--z-overlay)' }}
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="pointer-events-none absolute inset-6">
        <span className="absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2 border-primary" />
        <span className="absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2 border-primary" />
        <span className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-primary" />
        <span className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-primary" />
      </div>
      <span className="pointer-events-none absolute top-0 right-0 left-0 h-px bg-primary/20" />
      <span className="pointer-events-none absolute right-0 bottom-0 left-0 h-px bg-primary/20" />

      <div
        id="terminal-auth-title"
        className="data-label pointer-events-none absolute top-5 left-1/2 z-20 -translate-x-1/2"
      >
        // NK.SEC.AUTH // BIOMETRIC.GATE v3.7
      </div>

      <div className="absolute top-3 right-3 z-20 md:top-4 md:right-4">
        <CyberCloseButton onClick={onDismiss} className="ml-0" />
      </div>

      <div className="relative flex w-full max-w-4xl flex-col items-center justify-center gap-10">
        <div className="flex w-full max-w-3xl justify-between gap-4 font-mono text-[9px] uppercase tracking-widest text-primary/45">
          <span>SYS {clock}</span>
          <span>SESSION {session}</span>
          <span className="hidden sm:inline">CH NK-SEC-666</span>
          <span className="hidden sm:inline">PROTOCOL NK.BIO.3</span>
        </div>

        {variant === 'fingerprint' ? (
          <TerminalFingerprintAuth
            reducedMotion={reducedMotion}
            granted={status === 'granted'}
            onGranted={handleGranted}
            onDrop={handleDrop}
          />
        ) : variant === 'slider' ? (
          <TerminalSliderAuth
            reducedMotion={reducedMotion}
            granted={status === 'granted'}
            onGranted={handleGranted}
          />
        ) : (
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-primary/40">LINKING SENSOR</p>
        )}

        {status === 'drop' && variant === 'fingerprint' ? (
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-destructive">
            {t('secretTerminal.authRetry')}
          </p>
        ) : null}
      </div>
    </motion.div>
  )
}
