/**
 * Overlay opening animation — simple fade + scale-up,
 * consistent with the ProfileOverlay (biography members) style.
 */

import type { Transition } from 'framer-motion'

export interface OverlayAnimation {
  name: string
  backdrop: {
    initial: Record<string, unknown>
    animate: Record<string, unknown>
    exit: Record<string, unknown>
    transition?: Transition
  }
  modal: {
    initial: Record<string, unknown>
    animate: Record<string, unknown>
    exit: Record<string, unknown>
    transition?: Transition
  }
  /** CSS class name for the unique overlay loading indicator */
  loaderClass: string
  /** Label shown next to the loading indicator */
  loaderLabel: string
}

const overlayAnimations: OverlayAnimation[] = [
  {
    name: 'fadeScale',
    loaderClass: 'overlay-loader-circuit',
    loaderLabel: 'LOADING...',
    backdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },
    modal: {
      initial: { opacity: 0, scale: 0.85, y: 30 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.85, y: 30 },
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
    },
  },
]

/** Pick a random overlay animation variant */
export function getRandomOverlayAnimation(): OverlayAnimation {
  return overlayAnimations[Math.floor(Math.random() * overlayAnimations.length)]
}

/** Get all available animations (for testing/preview) */
export function getAllOverlayAnimations(): OverlayAnimation[] {
  return overlayAnimations
}
