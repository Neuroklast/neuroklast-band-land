'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TerminalAuthGate } from '@/components/overlays/TerminalAuthGate'
import { SecretTerminalContent } from '@/components/overlays/SecretTerminalContent'
import CyberCloseButton from '@/components/CyberCloseButton'

export function SecretTerminalPage({ siteName = 'Neuroklast' }: { siteName?: string }) {
  const router = useRouter()
  const [unlocked, setUnlocked] = useState(false)

  const goHome = useCallback(() => {
    router.push('/')
  }, [router])

  if (!unlocked) {
    return <TerminalAuthGate onUnlock={() => setUnlocked(true)} onDismiss={goHome} />
  }

  return (
    <div className="relative min-h-dvh bg-background scanline-effect">
      <span className="pointer-events-none absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2 border-primary" />
      <span className="pointer-events-none absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2 border-primary" />
      <span className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-primary" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-primary" />
      <div className="data-label pointer-events-none absolute top-5 left-1/2 z-20 -translate-x-1/2">
        // NK.SEC.AUTH // TERMINAL v3.7
      </div>
      <div className="absolute top-3 right-3 z-20 md:top-4 md:right-4">
        <CyberCloseButton onClick={goHome} className="ml-0" />
      </div>
      <div className="mx-auto w-full max-w-4xl px-4 pb-10 pt-16 md:px-12">
        <SecretTerminalContent siteName={siteName} />
      </div>
    </div>
  )
}
