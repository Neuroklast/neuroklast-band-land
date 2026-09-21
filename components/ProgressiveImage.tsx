'use client'

import { useState, useEffect, useMemo } from 'react'
import { buildImageSrcSet, largestWidth, resolveCdnImageUrl } from '@/lib/image-cdn'
import { canonicalImageUrl } from '@/lib/image-url'
import { useImageCdnMode } from '@/contexts/ImageCdnContext'

interface ProgressiveImageProps {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
  draggable?: boolean
  loading?: 'lazy' | 'eager'
  /** Responsive widths for `srcset` (resolved through the configured CDN). */
  widths?: number[]
  sizes?: string
  /** Above-the-fold image: eager + high fetch priority. */
  priority?: boolean
}

/**
 * Image component with a progress bar shown while loading.
 * Delivers through the admin-selected image CDN (wsrv / Vercel / direct).
 */
export default function ProgressiveImage({
  src,
  alt,
  className,
  style,
  draggable,
  loading,
  widths,
  sizes,
  priority = false,
}: ProgressiveImageProps) {
  const mode = useImageCdnMode()

  // Inline `widths` arrays would retrigger the effect on every render, so the
  // numeric list is memoized on its joined value.
  const widthsKey = (widths ?? []).join(',')
  const widthList = useMemo(
    () =>
      widthsKey
        ? widthsKey
            .split(',')
            .map((value) => Number(value))
            .filter((value) => Number.isFinite(value) && value > 0)
        : [],
    [widthsKey],
  )

  const [loaded, setLoaded] = useState(false)
  const [effectiveSrc, setEffectiveSrc] = useState(() =>
    resolveCdnImageUrl(canonicalImageUrl(src), mode, { w: largestWidth(widthList) }),
  )

  useEffect(() => {
    const newSrc = resolveCdnImageUrl(canonicalImageUrl(src), mode, {
      w: largestWidth(widthList),
    })
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEffectiveSrc(newSrc)
    setLoaded(false)

    // Check if image is already cached by the browser
    const img = new Image()
    img.src = newSrc
    if (img.complete) {
      setLoaded(true)
    }
    return () => { img.src = '' }
  }, [src, mode, widthList])

  const srcSet =
    widthList.length > 0 ? buildImageSrcSet(canonicalImageUrl(src), mode, widthList) : undefined

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 'var(--z-local-above-1)' } as React.CSSProperties}>
          <div className="w-3/4 max-w-[200px]">
            <div className="h-[2px] bg-primary/20 overflow-hidden">
              <div
                className="h-full bg-primary/80 animate-progress-bar"
              />
            </div>
            <p className="text-xs font-mono text-primary/40 text-center mt-1 tracking-wider">LOADING...</p>
          </div>
        </div>
      )}
      <img
        src={effectiveSrc}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt={alt}
        className={className}
        style={{ ...style, opacity: loaded ? 1 : 0, transition: 'opacity 0.3s ease-in' }}
        draggable={draggable}
        loading={priority ? 'eager' : loading}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}
