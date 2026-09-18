'use client'

import { useCallback, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import KonamiListener from '@/components/KonamiListener'
import {
  TERMINAL_AUTH_PATH,
  TERMINAL_CHEAT_PARAM,
  TERMINAL_OPEN_EVENT,
} from '@/lib/terminal-config'

export function SecretTerminalTrigger({ secretCode }: { secretCode: string[] }) {
  const router = useRouter()
  const pathname = usePathname()

  const activate = useCallback(() => {
    if (pathname === TERMINAL_AUTH_PATH) return
    router.push(TERMINAL_AUTH_PATH)
  }, [pathname, router])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.has(TERMINAL_CHEAT_PARAM)) return
    activate()
  }, [activate])

  useEffect(() => {
    const onRequest = () => activate()
    window.addEventListener(TERMINAL_OPEN_EVENT, onRequest)
    return () => window.removeEventListener(TERMINAL_OPEN_EVENT, onRequest)
  }, [activate])

  return <KonamiListener customCode={secretCode} onCodeActivated={activate} />
}
