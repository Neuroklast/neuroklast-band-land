'use client'

import { useCallback, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Warning } from '@phosphor-icons/react'
import { useLocale } from '@/contexts/LocaleContext'
import { cn } from '@/lib/utils'
import { EmbedConsentGate } from '@/components/motion/EmbedConsentGate'
import { PhaseCrossfade } from '@/components/motion/PhaseCrossfade'
import { useLinearProgress } from '@/hooks/use-linear-progress'
import { MOTION } from '@/lib/motion-tokens'
import { spotifyEmbedHeight, spotifyEmbedUrl } from '@/lib/spotify-artist'

interface SpotifyEmbedProps {
  uri: string
  width?: string | number
  height?: string | number
  theme?: '0' | '1'
  className?: string
}

export function SpotifyEmbed({
  uri,
  width = '100%',
  height,
  theme = '0',
  className,
}: SpotifyEmbedProps) {
  const { t } = useLocale()
  const reducedMotion = useReducedMotion() === true
  const [isLoaded, setIsLoaded] = useState(false)
  const embedUrl = spotifyEmbedUrl(uri, theme)
  const resolvedHeight = height ?? spotifyEmbedHeight(uri)

  const handleConsent = useCallback(() => setIsLoaded(true), [])
  const handleRetry = useCallback(() => setIsLoaded(false), [])
  const handoff = useLinearProgress(isLoaded && Boolean(embedUrl), MOTION.HANDOFF_MS, reducedMotion)

  if (isLoaded && !embedUrl) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-black/40 border border-destructive/30 rounded-none ${className}`}
        style={{ width, height: resolvedHeight }}
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
    <div className={cn('relative h-full w-full', className)} style={{ width, height: resolvedHeight }}>
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
            compact={typeof resolvedHeight === 'number' && resolvedHeight <= 160}
            onConsent={handleConsent}
          />
        }
        incoming={
          embedUrl ? (
            <iframe
              src={embedUrl}
              title={t('spotify.loadPlayer')}
              className="w-full border-0"
              width="100%"
              height={typeof resolvedHeight === 'number' ? resolvedHeight : undefined}
              style={{ height: resolvedHeight }}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="eager"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : null
        }
      />
    </div>
  )
}
