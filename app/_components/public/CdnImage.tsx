'use client'

import { useImageCdnMode } from '@/contexts/ImageCdnContext'
import { buildImageSrcSet, largestWidth, resolveCdnImageUrl } from '@/lib/image-cdn'
import { canonicalImageUrl } from '@/lib/image-url'

export interface CdnImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  style?: React.CSSProperties
  /** Responsive widths for `srcset` (CDN mode aware). Omit for a plain `src`. */
  widths?: number[]
  /** `sizes` attribute matching the layout. */
  sizes?: string
  /** Intrinsic size — always pass it to avoid layout shift. */
  width?: number
  height?: number
  /** Above-the-fold image: eager loading + high fetch priority. */
  priority?: boolean
  loading?: 'lazy' | 'eager'
  draggable?: boolean
  decoding?: 'async' | 'sync' | 'auto'
  /** Kept for the R2 media self-heal handler. */
  onError?: React.ReactEventHandler<HTMLImageElement>
}

/**
 * Plain `<img>` that resolves its URL through the configured image CDN.
 * No wrapper markup — safe to drop into existing layouts.
 */
export function CdnImage({
  src,
  alt,
  className,
  style,
  widths,
  sizes,
  width,
  height,
  priority = false,
  loading,
  draggable,
  decoding = 'async',
  onError,
}: CdnImageProps) {
  const mode = useImageCdnMode()
  const source = canonicalImageUrl(src)
  if (!source) return null

  const fallbackWidth = widths && widths.length > 0 ? largestWidth(widths) : undefined
  const resolvedSrc = resolveCdnImageUrl(source, mode, { w: fallbackWidth })
  const srcSet = widths && widths.length > 0 ? buildImageSrcSet(source, mode, widths) : undefined

  return (
    <img
      src={resolvedSrc}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      className={className}
      style={style}
      width={width}
      height={height}
      loading={priority ? 'eager' : loading}
      fetchPriority={priority ? 'high' : undefined}
      decoding={decoding}
      draggable={draggable}
      onError={onError}
    />
  )
}
