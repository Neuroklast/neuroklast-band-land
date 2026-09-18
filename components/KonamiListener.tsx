'use client'

import { useEffect } from 'react'
import { DEFAULT_KONAMI_CODE } from '@/lib/konami'

interface KonamiListenerProps {
  onCodeActivated?: () => void
  /** Custom key sequence. Falls back to the classic Konami code when omitted. */
  customCode?: string[]
}

export default function KonamiListener({ onCodeActivated, customCode }: KonamiListenerProps) {
  const code = customCode && customCode.length > 0 ? customCode : DEFAULT_KONAMI_CODE

  useEffect(() => {
    let konamiIndex = 0

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target
      if (target instanceof HTMLElement) {
        const tag = target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) return
      }

      const key = e.key.toLowerCase()
      const expectedKey = code[konamiIndex].toLowerCase()

      if (key === expectedKey) {
        konamiIndex++
        
        if (konamiIndex === code.length) {
          konamiIndex = 0
          e.preventDefault()
          onCodeActivated?.()
        }
      } else {
        konamiIndex = 0
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onCodeActivated, code])

  return null
}
