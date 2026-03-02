import { useCallback } from 'react'

interface OverlayTransitionProps {
  /** Whether the overlay is visible */
  show: boolean
  /** Callback when the entry animation is complete */
  onComplete?: () => void
}

/** No-op transition — previously a glitch flash, now renders nothing. */
export default function OverlayTransition(_props: OverlayTransitionProps) {
  return null
}

/** Hook that provides a trigger function and the transition element */
export function useOverlayTransition() {
  const trigger = useCallback(() => {}, [])

  const element = null

  return { trigger, element }
}
