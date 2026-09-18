'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { YoutubeLogo } from '@phosphor-icons/react'
import { EmbedConsentGate } from '@/components/motion/EmbedConsentGate'
import { PhaseCrossfade } from '@/components/motion/PhaseCrossfade'
import { useLinearProgress } from '@/hooks/use-linear-progress'
import { useLocale } from '@/contexts/LocaleContext'
import { MOTION } from '@/lib/motion-tokens'

interface YouTubeEmbedProps {
  videoId: string
  title?: string
}

export default function YouTubeEmbed({ videoId, title }: YouTubeEmbedProps) {
  const { t } = useLocale()
  const prefersReducedMotion = useReducedMotion()
  const reducedMotion = prefersReducedMotion === true
  const [consented, setConsented] = useState(false)
  const handoff = useLinearProgress(consented, MOTION.HANDOFF_MS, reducedMotion)
  const safeVideoId = /^[A-Za-z0-9_-]{11}$/.test(videoId) ? videoId : null

  if (!safeVideoId) return null

  return (
    <motion.div
      className="space-y-2"
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.3 }}
    >
      {title && (
        <div className="flex items-center gap-2 text-xs text-primary/70 font-mono tracking-wider">
          <YoutubeLogo size={14} weight="fill" className="text-primary/50" />
          <span className="truncate uppercase">{title}</span>
        </div>
      )}
      <div className="relative w-full aspect-video border border-primary/20 bg-black overflow-hidden">
        <PhaseCrossfade
          className="absolute inset-0 h-full"
          progress={consented ? handoff : 0}
          holdIncoming={consented}
          outgoing={
            <EmbedConsentGate
              ariaLabel={`Load YouTube video${title ? `: ${title}` : ''}`}
              title={t('embed.jackIn')}
              hint={t('youtube.consentHint')}
              className="h-full w-full border-0"
              onConsent={() => setConsented(true)}
            />
          }
          incoming={
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${safeVideoId}?autoplay=1`}
              title={title || 'YouTube video'}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
              loading="eager"
              referrerPolicy="no-referrer"
            />
          }
        />
      </div>
    </motion.div>
  )
}
