/**
 * Pure framer-motion variants for overlay choreography.
 * Kept separate from `components/motion/overlay-motion.tsx` so that module only
 * exports components (React Fast Refresh friendly) and these stay unit-testable.
 */

import type { Variants } from 'framer-motion'

/** Shared easing for overlay choreography (matches the shell handoff curve). */
export const OVERLAY_EASE = [0.16, 1, 0.3, 1] as const

export type OverlayItemVariant = 'rise' | 'slideLeft' | 'slideRight' | 'pop' | 'fade'

/** Parent orchestration: staggers children in on open, reverse on close. */
export function overlayStagger(
  reduced: boolean,
  options: { stagger?: number; delayChildren?: number } = {},
): Variants {
  if (reduced) return { hidden: {}, show: {}, exit: {} }
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren: options.stagger ?? 0.06,
        delayChildren: options.delayChildren ?? 0.08,
      },
    },
    exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
  }
}

/** Child reveal. `hidden` → `show` on open, back to `hidden` on close. */
export function overlayItem(
  reduced: boolean,
  variant: OverlayItemVariant = 'rise',
  distance = 16,
  delay = 0,
): Variants {
  if (reduced) {
    return { hidden: { opacity: 1 }, show: { opacity: 1 }, exit: { opacity: 1 } }
  }

  const hidden =
    variant === 'slideLeft'
      ? { opacity: 0, x: -distance }
      : variant === 'slideRight'
        ? { opacity: 0, x: distance }
        : variant === 'pop'
          ? { opacity: 0, scale: 0.82 }
          : variant === 'fade'
            ? { opacity: 0 }
            : { opacity: 0, y: distance }

  const shown =
    variant === 'slideLeft' || variant === 'slideRight'
      ? { opacity: 1, x: 0 }
      : variant === 'pop'
        ? { opacity: 1, scale: 1 }
        : variant === 'fade'
          ? { opacity: 1 }
          : { opacity: 1, y: 0 }

  return {
    hidden,
    show: { ...shown, transition: { duration: 0.42, ease: OVERLAY_EASE, delay } },
    exit: { ...hidden, transition: { duration: 0.2, ease: OVERLAY_EASE } },
  }
}

/** Image / panel scan reveal used on photos, artwork and covers. */
export function overlayScan(reduced: boolean): Variants {
  if (reduced) return { hidden: { opacity: 1 }, show: { opacity: 1 }, exit: { opacity: 1 } }
  return {
    hidden: { opacity: 0, clipPath: 'inset(0 0 100% 0)', filter: 'brightness(1.6)' },
    show: {
      opacity: 1,
      clipPath: 'inset(0 0 0% 0)',
      filter: 'brightness(1)',
      transition: { duration: 0.5, ease: OVERLAY_EASE },
    },
    exit: {
      opacity: 0,
      clipPath: 'inset(100% 0 0 0)',
      filter: 'brightness(1.6)',
      transition: { duration: 0.22, ease: OVERLAY_EASE },
    },
  }
}
