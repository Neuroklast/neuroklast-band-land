/**
 * Progressive Overlay Modes
 *
 * Four content-loading animation modes that can be applied to page sections
 * during initial reveal.  Each mode exposes Framer Motion `containerVariants`
 * and a matching CSS `className` so the consumer can choose the visual style.
 *
 * Ported from the `zardonic-industrial` reference implementation.
 */

import type { Variants, Transition } from 'framer-motion'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProgressiveMode {
  /** Unique identifier */
  name: string
  /** Human-readable label (localised-friendly factory) */
  getLabel: () => string
  /** CSS class applied to the container element */
  className: string
  /** Framer Motion container variants (parent that orchestrates children) */
  containerVariants: Variants
  /** Framer Motion transition override for the container */
  transition: Transition
}

// ---------------------------------------------------------------------------
// Mode definitions
// ---------------------------------------------------------------------------

/**
 * Progressive Reveal — clip-path scan sweeping from top to bottom.
 * Children reveal sequentially as the scan line passes them.
 */
const progressiveReveal: ProgressiveMode = {
  name: 'progressive-reveal',
  getLabel: () => 'Progressive Reveal',
  className: 'progressive-reveal',
  containerVariants: {
    hidden: { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
    visible: {
      clipPath: 'inset(0 0 0% 0)',
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        staggerChildren: 0.08,
      },
    },
  },
  transition: { duration: 0.8, ease: 'easeOut' },
}

/**
 * Data Stream — Matrix-style blur-to-sharp reveal.
 * Content appears as if downloaded over a noisy channel.
 */
const dataStream: ProgressiveMode = {
  name: 'data-stream',
  getLabel: () => 'Data Stream',
  className: 'data-stream',
  containerVariants: {
    hidden: { filter: 'blur(20px)', opacity: 0, y: -10 },
    visible: {
      filter: 'blur(0px)',
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.0,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.06,
      },
    },
  },
  transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
}

/**
 * Sector Assembly — block-by-block loading.
 * The container is divided into virtual sectors that snap in one at a time.
 */
const sectorAssembly: ProgressiveMode = {
  name: 'sector-assembly',
  getLabel: () => 'Sector Assembly',
  className: 'sector-assembly',
  containerVariants: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'anticipate',
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  },
  transition: { duration: 0.6, ease: 'anticipate' },
}

/**
 * Holographic Materialization — RGB-split flicker that stabilises.
 * Mimics a holographic projection coming into focus.
 */
const holographicMaterialization: ProgressiveMode = {
  name: 'holographic-materialization',
  getLabel: () => 'Holographic Materialization',
  className: 'holographic-materialization',
  containerVariants: {
    hidden: {
      opacity: 0,
      x: 4,
      filter: 'hue-rotate(90deg) saturate(3)',
    },
    visible: {
      opacity: 1,
      x: 0,
      filter: 'hue-rotate(0deg) saturate(1)',
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.07,
      },
    },
  },
  transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const ALL_MODES: ProgressiveMode[] = [
  progressiveReveal,
  dataStream,
  sectorAssembly,
  holographicMaterialization,
]

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Returns all available progressive overlay modes. */
export function getAllProgressiveModes(): ProgressiveMode[] {
  return ALL_MODES
}

/** Looks up a mode by its `name` field.  Returns `undefined` when unknown. */
export function getProgressiveMode(name: string): ProgressiveMode | undefined {
  return ALL_MODES.find((m) => m.name === name)
}

/** Returns a randomly selected progressive overlay mode. */
export function getRandomProgressiveMode(): ProgressiveMode {
  return ALL_MODES[Math.floor(Math.random() * ALL_MODES.length)]
}
