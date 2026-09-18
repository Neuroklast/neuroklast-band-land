'use client'

import { useEffect, useRef, useState } from 'react'
import { m } from 'framer-motion'
import { useLocale } from '@/contexts/LocaleContext'
import { useOverlay } from '@/contexts/OverlayContext'
import { resolveSectionHeading } from '@/lib/section-display'
import type { Partner } from '@/lib/app-types'
import {
  loadLogoImageForCanvas,
  logoRasterSize,
  PARTNER_LOGO_CANVAS_MAX,
  preparePartnerLogoSrc,
  processLogoToWhiteSilhouette,
} from '@/lib/partner-logo-white'
import { SectionWrapper, SectionEmpty, SectionHeading, SectionIntro } from './SectionWrapper'

type PartnerItem = Partner

const processedLogoCache = new Map<string, string>()

const logoImgClass =
  'partner-logo-white h-12 w-auto min-w-[4rem] max-w-[8.5rem] object-contain md:h-16 md:max-w-[10rem]'

/**
 * Partner / credit logo in white mode.
 * Shows the original immediately, then canvas-processes in view so alpha is
 * real and baked white backgrounds are stripped.
 */
function PartnerLogoWhite({
  src,
  name,
  brightness,
}: {
  src: string
  name: string
  brightness: number
}) {
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [processedSrc, setProcessedSrc] = useState<string | null>(() => processedLogoCache.get(src) ?? null)
  const [inView, setInView] = useState(() => processedLogoCache.has(src))

  useEffect(() => {
    const cached = processedLogoCache.get(src)
    if (cached) {
      setProcessedSrc(cached)
      setInView(true)
      return
    }
    setProcessedSrc(null)
    setInView(false)
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const el = imgRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '160px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [src])

  useEffect(() => {
    if (!inView || processedSrc) return
    let cancelled = false

    const run = async () => {
      try {
        const img = await loadLogoImageForCanvas(src)
        if (cancelled) return

        const w = img.naturalWidth || img.width
        const h = img.naturalHeight || img.height
        if (!w || !h) throw new Error('empty logo')

        const { width: cw, height: ch } = logoRasterSize(w, h, 256, PARTNER_LOGO_CANVAS_MAX)

        const canvas = document.createElement('canvas')
        canvas.width = cw
        canvas.height = ch
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) throw new Error('no canvas')

        ctx.clearRect(0, 0, cw, ch)
        ctx.drawImage(img, 0, 0, cw, ch)
        const raw = ctx.getImageData(0, 0, cw, ch)
        const processed = processLogoToWhiteSilhouette(raw)
        const out = ctx.createImageData(processed.width, processed.height)
        out.data.set(processed.data)
        ctx.putImageData(out, 0, 0)

        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, 'image/png')
        })
        if (cancelled) return
        const next = blob ? URL.createObjectURL(blob) : canvas.toDataURL('image/png')
        processedLogoCache.set(src, next)
        setProcessedSrc(next)
      } catch {
        if (!cancelled) setProcessedSrc(null)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [src, inView, processedSrc])

  return (
    <m.img
      ref={imgRef}
      src={processedSrc ?? src}
      alt={name}
      className={logoImgClass}
      style={{ opacity: brightness, background: 'transparent' }}
      initial={false}
      animate={{ opacity: brightness }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      decoding="async"
      loading="lazy"
    />
  )
}

function PartnerNameFallback({ name }: { name: string }) {
  return (
    <m.span
      className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground"
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {name}
    </m.span>
  )
}

function PartnerLogoNative({
  src,
  name,
  brightness,
}: {
  src: string
  name: string
  brightness: number
}) {
  const [displaySrc, setDisplaySrc] = useState(src)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    let blobUrl: string | null = null
    void preparePartnerLogoSrc(src).then((next) => {
      if (cancelled) {
        if (next.startsWith('blob:')) URL.revokeObjectURL(next)
        return
      }
      if (next && next !== src) {
        blobUrl = next
        setDisplaySrc(next)
      }
    })
    return () => {
      cancelled = true
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [src])

  if (failed) return <PartnerNameFallback name={name} />

  return (
    <m.img
      src={displaySrc}
      alt={name}
      className="partner-logo-native h-12 w-auto min-w-[4rem] max-w-[8.5rem] object-contain transition-opacity hover:opacity-100 md:h-16 md:max-w-[10rem]"
      style={{ opacity: brightness, background: 'transparent' }}
      initial={false}
      animate={{ opacity: brightness }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      decoding="async"
      loading="lazy"
      onError={() => {
        if (displaySrc !== src) {
          setDisplaySrc(src)
          return
        }
        setFailed(true)
      }}
    />
  )
}

function PartnerLogo({
  item,
  logoBrightness,
}: {
  item: PartnerItem
  logoBrightness?: number
}) {
  if (!item.logoUrl) {
    return <PartnerNameFallback name={item.name} />
  }

  const useWhite = item.logoWhite !== false
  const brightness =
    logoBrightness !== undefined ? Math.min(Math.max(logoBrightness, 0.25), 1) : 0.92

  if (useWhite) {
    return <PartnerLogoWhite src={item.logoUrl} name={item.name} brightness={brightness} />
  }

  // logo_white off: original colours; SVG rewritten to a large view size so it stays sharp
  return (
    <PartnerLogoNative
      key={item.logoUrl}
      src={item.logoUrl}
      name={item.name}
      brightness={brightness}
    />
  )
}

interface CreditsAndEndorsementsProps {
  credits: PartnerItem[]
  endorsements: PartnerItem[]
  partners?: PartnerItem[]
  heading?: string
  intro?: string
  logoBrightness?: number
}

function LogoGrid({
  items,
  heading,
  logoBrightness,
  onSelect,
}: {
  items: PartnerItem[]
  heading: string
  logoBrightness?: number
  onSelect: (item: PartnerItem) => void
}) {
  if (items.length === 0) return null

  return (
    <div className="space-y-6">
      <div className="data-label" data-theme-color="data-label">
        // {heading}
      </div>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((item) => {
          const content = <PartnerLogo item={item} logoBrightness={logoBrightness} />
          // group so chromatic hover fires for the full cell hit-area, not only the img pixels
          const wrapperClassName =
            'partner-logo-cell group flex min-h-28 cursor-pointer items-center justify-center bg-transparent p-3'

          return (
            <button
              key={item.id}
              type="button"
              className={wrapperClassName}
              aria-label={item.name}
              onClick={() => onSelect(item)}
            >
              {content}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function CreditsSection({
  credits,
  endorsements,
  partners = [],
  heading,
  intro,
  logoBrightness,
}: CreditsAndEndorsementsProps) {
  const { t, locale } = useLocale()
  const { openOverlay } = useOverlay()
  const title = resolveSectionHeading(heading, 'credits', t, locale)
  const hasAny = credits.length > 0 || endorsements.length > 0 || partners.length > 0
  const openPartner = (item: PartnerItem) => openOverlay({ type: 'partner', data: item })

  return (
    <SectionWrapper id="credits" data-theme-color="foreground card border">
      <SectionHeading sectionId="credits" dataText={title}>
        {title}
      </SectionHeading>
      <SectionIntro sectionId="credits">{intro}</SectionIntro>

      {hasAny ? (
        <div className="space-y-12">
          <LogoGrid items={credits} heading={t('credits.groupCredits').toLocaleUpperCase(locale)} logoBrightness={logoBrightness} onSelect={openPartner} />
          <LogoGrid items={endorsements} heading={t('credits.groupEndorsements').toLocaleUpperCase(locale)} logoBrightness={logoBrightness} onSelect={openPartner} />
          <LogoGrid items={partners} heading={t('credits.groupPartners').toLocaleUpperCase(locale)} logoBrightness={logoBrightness} onSelect={openPartner} />
        </div>
      ) : (
        <SectionEmpty label={t('credits.empty')} />
      )}
    </SectionWrapper>
  )
}
