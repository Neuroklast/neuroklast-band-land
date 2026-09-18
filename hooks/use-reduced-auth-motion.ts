import { useReducedMotion } from 'framer-motion'

export function useReducedAuthMotion(): boolean {
  const prefersReducedMotion = useReducedMotion()
  return (
    prefersReducedMotion === true ||
    (typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  )
}
