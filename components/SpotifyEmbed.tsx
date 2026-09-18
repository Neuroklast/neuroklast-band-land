'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Warning } from '@phosphor-icons/react'
import { useLocale } from '@/contexts/LocaleContext'
import { cn } from '@/lib/utils'
import { EmbedConsentGate } from '@/components/motion/EmbedConsentGate'
import { PhaseCrossfade } from '@/components/motion/PhaseCrossfade'
import { useLinearProgress } from '@/hooks/use-linear-progress'
import { MOTION } from '@/lib/motion-tokens'

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (IFrameAPI: SpotifyIFrameAPI) => void
    SpotifyIframeApi?: SpotifyIFrameAPI
  }
}

interface SpotifyIFrameAPI {
  createController(
    element: HTMLElement,
    options: SpotifyEmbedOptions,
    callback?: (controller: SpotifyEmbedController) => void,
  ): void
}

interface SpotifyEmbedController {
  loadUri(uri: string): void
  play(): void
  togglePlay(): void
  seek(seconds: number): void
  destroy(): void
}

interface SpotifyEmbedOptions {
  uri: string
  width?: string | number
  height?: string | number
  theme?: string
}

interface SpotifyEmbedProps {
  uri: string
  width?: string | number
  height?: string | number
  theme?: '0' | '1'
  className?: string
}

const SCRIPT_LOAD_TIMEOUT_MS = 15_000

export function SpotifyEmbed({
  uri,
  width = '100%',
  height = 352,
  theme = '0',
  className,
}: SpotifyEmbedProps) {
  const { t } = useLocale()
  const reducedMotion = useReducedMotion() === true
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const [hasError, setHasError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<SpotifyEmbedController | null>(null)
  const initializedRef = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleConsent = useCallback(() => setIsLoaded(true), [])

  const handleRetry = useCallback(() => {
    setHasError(false)
    setIsPlayerReady(false)
    initializedRef.current = false
    setIsLoaded(false)
  }, [])

  const createPlayer = useCallback(
    (IFrameAPI: SpotifyIFrameAPI) => {
      if (!containerRef.current || initializedRef.current) return
      initializedRef.current = true

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      const options: SpotifyEmbedOptions = {
        uri,
        width,
        height,
        theme,
      }

      try {
        IFrameAPI.createController(containerRef.current, options, (controller) => {
          controllerRef.current = controller
          setIsPlayerReady(true)
        })
      } catch {
        setHasError(true)
      }
    },
    [uri, width, height, theme],
  )

  useEffect(() => {
    if (!isLoaded) return

    // If the API is already loaded, create the player directly
    if (window.SpotifyIframeApi) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      createPlayer(window.SpotifyIframeApi)
      return
    }

    const setupCallback = () => {
      const previousCallback = window.onSpotifyIframeApiReady
      window.onSpotifyIframeApiReady = (IFrameAPI) => {
        window.SpotifyIframeApi = IFrameAPI
        if (previousCallback) previousCallback(IFrameAPI)
        createPlayer(IFrameAPI)
      }
    }

    // Check if the script is already in the document
    const existingScript = document.querySelector(
      'script[src="https://open.spotify.com/embed/iframe-api/v1"]',
    )

    if (!existingScript) {
      setupCallback()
      const script = document.createElement('script')
      script.src = 'https://open.spotify.com/embed/iframe-api/v1'
      script.async = true
      script.onerror = () => setHasError(true)
      document.body.appendChild(script)
    } else {
      // Script exists but API not ready yet — wait for callback
      setupCallback()
    }

    // Timeout: if the SDK hasn't initialized after 15s, show error
    timeoutRef.current = setTimeout(() => {
      if (!initializedRef.current) {
        setHasError(true)
      }
    }, SCRIPT_LOAD_TIMEOUT_MS)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      if (controllerRef.current) {
        controllerRef.current.destroy()
        controllerRef.current = null
      }
    }
  }, [createPlayer, isLoaded])

  const handoff = useLinearProgress(isLoaded && !hasError, MOTION.HANDOFF_MS, reducedMotion)

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-black/40 border border-destructive/30 rounded-none ${className}`}
        style={{ width, height }}
        role="alert"
      >
        <Warning className="w-10 h-10 text-destructive/70 mb-3" />
        <p className="font-mono text-sm text-muted-foreground text-center px-4">
          {t('spotify.failed')}
        </p>
        <button
          onClick={handleRetry}
          className="mt-3 font-mono text-xs text-primary hover:underline"
        >
          {t('spotify.retry')}
        </button>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)} style={{ width, height }}>
      <PhaseCrossfade
        className="h-full"
        progress={isLoaded ? handoff : 0}
        holdIncoming={isLoaded}
        outgoing={
          <EmbedConsentGate
            ariaLabel={t('spotify.loadPlayer')}
            title={t('spotify.loadPlayer')}
            hint={t('spotify.consentHint')}
            className="h-full w-full border-0"
            onConsent={handleConsent}
          />
        }
        incoming={
          <div className="relative h-full w-full">
            {!isPlayerReady && (
              <div
                className="absolute inset-0 bg-black/40 border border-primary/20 flex flex-col gap-3 p-4 animate-pulse"
                aria-label={t('spotify.loading')}
                aria-live="polite"
                aria-busy="true"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 shrink-0 bg-primary/10 rounded-sm" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-primary/15 rounded-sm w-3/4" />
                    <div className="h-2 bg-primary/10 rounded-sm w-1/2" />
                  </div>
                </div>
                <div className="h-1 bg-primary/10 rounded-full w-full mt-1">
                  <div className="h-1 bg-primary/20 rounded-full w-1/3" />
                </div>
                <div className="flex items-center justify-center gap-4 mt-1">
                  <div className="w-5 h-5 bg-primary/10 rounded-full" />
                  <div className="w-8 h-8 bg-primary/15 rounded-full" />
                  <div className="w-5 h-5 bg-primary/10 rounded-full" />
                </div>
                <div className="space-y-2 mt-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-3 bg-primary/10 rounded-sm shrink-0" />
                      <div className="h-2 bg-primary/10 rounded-sm flex-1" style={{ width: `${60 + i * 10}%` }} />
                      <div className="w-8 h-2 bg-primary/10 rounded-sm shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div ref={containerRef} className="w-full h-full" />
          </div>
        }
      />
    </div>
  )
}
