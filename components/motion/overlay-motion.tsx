'use client'

import type { ReactNode, SyntheticEvent } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import {
  overlayItem,
  overlayScan,
  overlayStagger,
  OVERLAY_EASE,
  type OverlayItemVariant,
} from '@/lib/overlay-motion'

interface OverlayRevealProps {
  children: ReactNode
  className?: string
  stagger?: number
  delayChildren?: number
  /** Set while the overlay is closing so children play their exit variants. */
  closing?: boolean
}

/** Staggered container. Wrap the whole overlay body in this. */
export function OverlayReveal({
  children,
  className,
  stagger,
  delayChildren,
  closing = false,
}: OverlayRevealProps) {
  const reduced = useReducedMotion() === true
  return (
    <motion.div
      className={className}
      variants={overlayStagger(reduced, { stagger, delayChildren })}
      initial="hidden"
      animate={closing ? 'exit' : 'show'}
    >
      {children}
    </motion.div>
  )
}

interface OverlayItemProps {
  children: ReactNode
  className?: string
  variant?: OverlayItemVariant
  distance?: number
  /** Explicit stagger delay in seconds (use when children are nested in layout wrappers). */
  delay?: number
}

/** A single staggered child. Must live inside an `OverlayReveal`. */
export function OverlayItem({
  children,
  className,
  variant = 'rise',
  distance,
  delay,
}: OverlayItemProps) {
  const reduced = useReducedMotion() === true
  return (
    <motion.div className={className} variants={overlayItem(reduced, variant, distance, delay)}>
      {children}
    </motion.div>
  )
}

/** Motion image with the scan reveal. Must live inside an `OverlayReveal`. */
export function OverlayScanImage({
  src,
  alt,
  className,
  loading,
  decoding,
  draggable,
  onError,
}: {
  src: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'sync' | 'auto'
  draggable?: boolean
  onError?: (event: SyntheticEvent<HTMLImageElement>) => void
}) {
  const reduced = useReducedMotion() === true
  return (
    <motion.img
      src={src}
      alt={alt}
      className={className}
      variants={overlayScan(reduced)}
      loading={loading}
      decoding={decoding}
      draggable={draggable}
      onError={onError}
    />
  )
}

/** HUD corner brackets that draw in with the staggered body. */
export function OverlayFrame({ className }: { className?: string }) {
  const reduced = useReducedMotion() === true
  const cornerVariants: Variants = reduced
    ? { hidden: { opacity: 1 }, show: { opacity: 1 }, exit: { opacity: 1 } }
    : {
        hidden: { opacity: 0, scale: 0.4 },
        show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: OVERLAY_EASE } },
        exit: { opacity: 0, scale: 0.4, transition: { duration: 0.18 } },
      }
  const corners = [
    'top-0 left-0 border-t-2 border-l-2',
    'top-0 right-0 border-t-2 border-r-2',
    'bottom-0 left-0 border-b-2 border-l-2',
    'bottom-0 right-0 border-b-2 border-r-2',
  ]
  return (
    <span aria-hidden className={`pointer-events-none absolute inset-0 ${className ?? ''}`}>
      {corners.map((position) => (
        <motion.span
          key={position}
          className={`absolute h-3 w-3 border-primary ${position}`}
          variants={cornerVariants}
        />
      ))}
    </span>
  )
}
