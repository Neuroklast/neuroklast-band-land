'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TerminalAuthControls, TerminalAuthShell } from '@/components/overlays/TerminalAuthGate'
import { useReducedAuthMotion } from '@/hooks/use-reduced-auth-motion'
import { SecretTerminalContent } from '@/components/overlays/SecretTerminalContent'
import { HatchDoors } from '@/components/motion/HatchDoors'
import { PhaseCrossfade } from '@/components/motion/PhaseCrossfade'
import { useLinearProgress } from '@/hooks/use-linear-progress'
import { useLocale } from '@/contexts/LocaleContext'
import { TERMINAL_AUTH } from '@/lib/terminal-auth-physics'
import { MOTION } from '@/lib/motion-tokens'

type SequencePhase = 'arm' | 'hatch'

export function SecretTerminalPage({ siteName = 'Neuroklast' }: { siteName?: string }) {
  const router = useRouter()
  const { t } = useLocale()
  const reducedMotion = useReducedAuthMotion()
  const [phase, setPhase] = useState<SequencePhase>('arm')
  const [granted, setGranted] = useState(false)
  const [drop, setDrop] = useState(false)
  const unlockedRef = useRef(false)

  const goHome = useCallback(() => {
    router.push('/')
  }, [router])

  const hatchActive = phase === 'hatch' || (reducedMotion && granted)
  const hatch = useLinearProgress(hatchActive, reducedMotion ? MOTION.REDUCED_MS : MOTION.HATCH_MS, reducedMotion)
  const hatchTimerRef = useRef(0)

  useEffect(() => () => window.clearTimeout(hatchTimerRef.current), [])

  const handleGranted = useCallback(() => {
    if (unlockedRef.current) return
    unlockedRef.current = true
    setGranted(true)
    const delay = reducedMotion ? MOTION.REDUCED_MS : TERMINAL_AUTH.GRANT_HOLD_MS
    hatchTimerRef.current = window.setTimeout(() => {
      setPhase('hatch')
    }, delay)
  }, [reducedMotion])

  const handleDrop = useCallback(() => {
    if (unlockedRef.current) return
    setDrop(true)
  }, [])

  const live = hatch >= 1 || (reducedMotion && granted)
  const title = live ? '// NK.SEC.AUTH // TERMINAL v3.7' : '// NK.SEC.AUTH // BIOMETRIC.GATE v3.7'

  return (
    <TerminalAuthShell
      title={title}
      onDismiss={goHome}
      reducedMotion={reducedMotion}
      ariaLabel={t('secretTerminal.authTitle')}
    >
      <div className="relative flex h-full w-full items-center justify-center">
        <div className="relative w-full max-w-4xl">
          <PhaseCrossfade
            progress={reducedMotion && live ? 1 : hatch}
            outgoing={
              <TerminalAuthControls
                reducedMotion={reducedMotion}
                granted={granted}
                drop={drop}
                onGranted={handleGranted}
                onDrop={handleDrop}
              />
            }
            incoming={
              <div className="px-4 pb-10 pt-8 md:px-12">
                <SecretTerminalContent siteName={siteName} />
              </div>
            }
          />
        </div>
        <HatchDoors progress={hatch} active={hatchActive && !reducedMotion} />
      </div>
    </TerminalAuthShell>
  )
}
