/**
 * Cyberpunk 2077-style overlay opening animations.
 * A random variant is selected each time an overlay opens.
 */

import type { Transition, TargetAndTransition } from 'framer-motion'

export type OverlayInterior = 'handshake' | 'post' | 'sectorSweep' | 'packetFill' | 'irisLock'

export interface OverlayAnimation {
  name: string
  backdrop: {
    initial: TargetAndTransition
    animate: TargetAndTransition
    exit: TargetAndTransition
    transition?: Transition
  }
  modal: {
    initial: TargetAndTransition
    animate: TargetAndTransition
    exit: TargetAndTransition
    transition?: Transition
  }
  loaderClass: string
  loaderLabel: string
  interior?: OverlayInterior
}

const circuitBreakBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
} as const

const circuitBreakModal = {
  initial: { opacity: 0, clipPath: 'polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)', filter: 'brightness(2)' },
  animate: { opacity: 1, clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', filter: 'brightness(1)' },
  exit: { opacity: 0, clipPath: 'polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)', filter: 'brightness(2)' },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
} as const

const overlayAnimations: OverlayAnimation[] = [
  {
    name: 'circuitBreak',
    loaderClass: 'overlay-loader-circuit',
    loaderLabel: 'CIRCUIT LINK',
    backdrop: circuitBreakBackdrop,
    modal: circuitBreakModal,
  },
  {
    name: 'circuitHandshake',
    loaderClass: 'overlay-loader-circuit',
    loaderLabel: 'CIRCUIT HANDSHAKE',
    interior: 'handshake',
    backdrop: circuitBreakBackdrop,
    modal: circuitBreakModal,
  },

  {
    name: 'systemBoot',
    loaderClass: 'overlay-loader-boot',
    loaderLabel: 'BOOTING SYSTEM',
    backdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.15 },
    },
    modal: {
      initial: { opacity: 0, clipPath: 'inset(0 0 100% 0)', filter: 'brightness(1.5)' },
      animate: { opacity: 1, clipPath: 'inset(0 0 0% 0)', filter: 'brightness(1)' },
      exit: { opacity: 0, clipPath: 'inset(100% 0 0 0)', filter: 'brightness(1.5)' },
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
  },
  {
    name: 'systemPost',
    loaderClass: 'overlay-loader-boot',
    loaderLabel: 'SYSTEM POST',
    interior: 'post',
    backdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.15 },
    },
    modal: {
      initial: { opacity: 0, clipPath: 'inset(0 0 100% 0)', filter: 'brightness(1.5)' },
      animate: { opacity: 1, clipPath: 'inset(0 0 0% 0)', filter: 'brightness(1)' },
      exit: { opacity: 0, clipPath: 'inset(100% 0 0 0)', filter: 'brightness(1.5)' },
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
  },

  // 3. Glitch Scan — horizontal clip-path with hue flash (no movement)
  {
    name: 'glitchScan',
    loaderClass: 'overlay-loader-scan',
    loaderLabel: 'SCANNING SECTORS',
    backdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.15 },
    },
    modal: {
      initial: { opacity: 0, clipPath: 'inset(0 100% 0 0)', filter: 'brightness(2) hue-rotate(90deg)' },
      animate: { opacity: 1, clipPath: 'inset(0 0% 0 0)', filter: 'brightness(1) hue-rotate(0deg)' },
      exit: { opacity: 0, clipPath: 'inset(0 0 0 100%)', filter: 'brightness(2) hue-rotate(-90deg)' },
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
    },
  },
  {
    name: 'sectorSweep',
    loaderClass: 'overlay-loader-scan',
    loaderLabel: 'SECTOR SWEEP',
    interior: 'sectorSweep',
    backdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.15 },
    },
    modal: {
      initial: { opacity: 0, clipPath: 'inset(0 100% 0 0)', filter: 'brightness(2)' },
      animate: { opacity: 1, clipPath: 'inset(0 0% 0 0)', filter: 'brightness(1)' },
      exit: { opacity: 0, clipPath: 'inset(0 0 0 100%)', filter: 'brightness(2)' },
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
    },
  },

  // 4. Data Stream — clip-path reveal from bottom with brightness flash
  {
    name: 'dataStream',
    loaderClass: 'overlay-loader-blocks',
    loaderLabel: 'BUFFERING STREAM',
    backdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },
    modal: {
      initial: { opacity: 0, clipPath: 'inset(100% 0 0 0)', filter: 'brightness(2)' },
      animate: { opacity: 1, clipPath: 'inset(0 0 0 0)', filter: 'brightness(1)' },
      exit: { opacity: 0, clipPath: 'inset(0 0 100% 0)', filter: 'brightness(2)' },
      transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
  {
    name: 'packetFill',
    loaderClass: 'overlay-loader-blocks',
    loaderLabel: 'PACKET FILL',
    interior: 'packetFill',
    backdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },
    modal: {
      initial: { opacity: 0, clipPath: 'inset(100% 0 0 0)', filter: 'brightness(2)' },
      animate: { opacity: 1, clipPath: 'inset(0 0 0 0)', filter: 'brightness(1)' },
      exit: { opacity: 0, clipPath: 'inset(0 0 100% 0)', filter: 'brightness(2)' },
      transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },

  // 5. Neural Jack-In — opacity flash with chromatic filter
  {
    name: 'neuralJackIn',
    loaderClass: 'overlay-loader-pulse',
    loaderLabel: 'NEURAL JACK-IN',
    backdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.15 },
    },
    modal: {
      initial: { opacity: 0, filter: 'brightness(3) saturate(2) hue-rotate(45deg)' },
      animate: { opacity: 1, filter: 'brightness(1) saturate(1) hue-rotate(0deg)' },
      exit: { opacity: 0, filter: 'brightness(2) saturate(1.5) hue-rotate(-45deg)' },
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
    },
  },
  {
    name: 'irisLock',
    loaderClass: 'overlay-loader-ring',
    loaderLabel: 'IRIS LOCK',
    interior: 'irisLock',
    backdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },
    modal: {
      initial: { opacity: 0, clipPath: 'circle(0% at 50% 50%)', filter: 'brightness(1.4)' },
      animate: { opacity: 1, clipPath: 'circle(80% at 50% 50%)', filter: 'brightness(1)' },
      exit: { opacity: 0, clipPath: 'circle(0% at 50% 50%)', filter: 'brightness(1.4)' },
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
  },

  // 6. Hologram Materialize — diagonal clip-path reveal
  {
    name: 'hologramMaterialize',
    loaderClass: 'overlay-loader-holo',
    loaderLabel: 'MATERIALIZING',
    backdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },
    modal: {
      initial: { opacity: 0, clipPath: 'polygon(0 0, 0 0, 0 0, 0 0)', filter: 'brightness(2)' },
      animate: { opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', filter: 'brightness(1)' },
      exit: { opacity: 0, clipPath: 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)', filter: 'brightness(2)' },
      transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },

  // 7. Matrix Decode — center-out clip-path with hue-rotate
  {
    name: 'matrixDecode',
    loaderClass: 'overlay-loader-matrix',
    loaderLabel: 'DECODING MATRIX',
    backdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },
    modal: {
      initial: { opacity: 0, clipPath: 'inset(50% 50% 50% 50%)', filter: 'brightness(2) hue-rotate(180deg)' },
      animate: { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', filter: 'brightness(1) hue-rotate(0deg)' },
      exit: { opacity: 0, clipPath: 'inset(50% 50% 50% 50%)', filter: 'brightness(2) hue-rotate(-180deg)' },
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
    },
  },

  // 8. Ring Link — horizontal split reveal from center
  {
    name: 'ringLink',
    loaderClass: 'overlay-loader-ring',
    loaderLabel: 'ESTABLISHING LINK',
    backdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },
    modal: {
      initial: { opacity: 0, clipPath: 'inset(50% 0 50% 0)', filter: 'brightness(1.8)' },
      animate: { opacity: 1, clipPath: 'inset(0% 0 0% 0)', filter: 'brightness(1)' },
      exit: { opacity: 0, clipPath: 'inset(50% 0 50% 0)', filter: 'brightness(1.8)' },
      transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
]

export const NONE_OVERLAY_ANIMATION: OverlayAnimation = {
  name: 'none',
  loaderClass: '',
  loaderLabel: '',
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.1 },
  },
  modal: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.1 },
  },
}

export function applySpeedFactor(animation: OverlayAnimation, speed: number): OverlayAnimation {
  if (!speed || speed === 1) return animation
  const factor = 1 / Math.max(0.01, speed)
  const scaleTransition = (t: Transition | undefined): Transition | undefined => {
    if (!t || t.duration === undefined) return t
    return { ...t, duration: t.duration * factor }
  }
  return {
    ...animation,
    backdrop: { ...animation.backdrop, transition: scaleTransition(animation.backdrop.transition) },
    modal: { ...animation.modal, transition: scaleTransition(animation.modal.transition) },
  }
}

export function getRandomOverlayAnimation(): OverlayAnimation {
  return overlayAnimations[Math.floor(Math.random() * overlayAnimations.length)]
}

export function getOverlayAnimationByName(name?: string | null): OverlayAnimation {
  if (name === 'none') return NONE_OVERLAY_ANIMATION
  if (!name || name === 'random') return getRandomOverlayAnimation()
  const found = overlayAnimations.find((a) => a.name === name)
  return found ?? getRandomOverlayAnimation()
}

export function resolveOverlayAnimation(
  name?: string | null,
  reducedMotion?: boolean | null,
): OverlayAnimation {
  if (reducedMotion) return NONE_OVERLAY_ANIMATION
  return getOverlayAnimationByName(name)
}

export function getAllOverlayAnimations(): OverlayAnimation[] {
  return overlayAnimations
}

export function getClipShellNames(): string[] {
  return overlayAnimations.filter((animation) => !animation.interior).map((animation) => animation.name)
}

export function parseOverlayAnimationName(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.trim() === '') return undefined
  if (value === 'none' || value === 'random') return value
  if (overlayAnimations.some((animation) => animation.name === value)) return value
  return undefined
}

export function parseOverlayAnimationPool(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => parseOverlayAnimationName(entry))
      .filter((name): name is string => Boolean(name) && name !== 'none' && name !== 'random')
  }
  const single = parseOverlayAnimationName(value)
  if (single && single !== 'none' && single !== 'random') return [single]
  return []
}

export function pickOverlayAnimationFromPool(
  pool: string[] | undefined,
  reducedMotion?: boolean | null,
): OverlayAnimation {
  if (reducedMotion) return NONE_OVERLAY_ANIMATION
  const names = pool && pool.length > 0 ? pool : getClipShellNames()
  const name = names[Math.floor(Math.random() * names.length)]
  return getOverlayAnimationByName(name)
}
