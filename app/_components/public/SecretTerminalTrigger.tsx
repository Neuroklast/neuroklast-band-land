'use client'

import { useCallback, useEffect } from 'react'
import KonamiListener from '@/components/KonamiListener'
import { useOverlay } from '@/contexts/OverlayContext'
import { TERMINAL_CHEAT_PARAM } from '@/lib/terminal-config'

export function SecretTerminalTrigger({ secretCode }: { secretCode: string[] }) {
  const { overlay, openOverlay } = useOverlay()

  const activate = useCallback(() => {
    if (overlay?.type === 'terminal') return
    openOverlay({ type: 'terminal' })
  }, [overlay, openOverlay])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.has(TERMINAL_CHEAT_PARAM)) return
    activate()
    params.delete(TERMINAL_CHEAT_PARAM)
    const query = params.toString()
    const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
    window.history.replaceState({}, '', next)
  }, [activate])

  return <KonamiListener customCode={secretCode} onCodeActivated={activate} />
}
