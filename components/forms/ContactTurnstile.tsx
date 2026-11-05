'use client'

import Script from 'next/script'
import { useCallback, useEffect, useRef } from 'react'

interface TurnstileApi {
  render: (element: HTMLElement, options: {
    sitekey: string
    action: string
    theme: 'dark'
    appearance: 'interaction-only'
  }) => string
  reset: (id: string) => void
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

/**
 * Optional until a Turnstile widget has been configured. The widget inserts
 * its own cf-turnstile-response field into the surrounding form.
 */
export function ContactTurnstile({ resetSignal }: { resetSignal?: unknown }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<string | null>(null)

  const mount = useCallback(() => {
    if (!siteKey || !containerRef.current || !window.turnstile || widgetRef.current) return
    widgetRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action: 'contact',
      theme: 'dark',
      appearance: 'interaction-only',
    })
  }, [siteKey])

  useEffect(() => {
    mount()
    return () => {
      if (widgetRef.current) {
        window.turnstile?.remove(widgetRef.current)
        widgetRef.current = null
      }
    }
  }, [mount])

  useEffect(() => {
    if (resetSignal !== undefined && widgetRef.current) {
      window.turnstile?.reset(widgetRef.current)
    }
  }, [resetSignal])

  if (!siteKey) return null

  return (
    <div aria-label="Spam protection">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={mount}
      />
      <div ref={containerRef} />
    </div>
  )
}
