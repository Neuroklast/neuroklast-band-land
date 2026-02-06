import { useScrollAberration } from '@/hooks/use-scroll-aberration'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface ChromaticTextProps {
  children: ReactNode
  className?: string
  intensity?: number
}

export function ChromaticText({ children, className, intensity = 1 }: ChromaticTextProps) {
  const { aberrationIntensity } = useScrollAberration()

  const offsetX = aberrationIntensity * intensity * 2
  const offsetY = aberrationIntensity * intensity * 0.5

  const textShadow = aberrationIntensity > 0.01
    ? `
        ${offsetX}px ${offsetY}px 0 oklch(0.50 0.22 25 / ${aberrationIntensity * 0.8}),
        ${-offsetX}px ${-offsetY}px 0 oklch(0.60 0.24 200 / ${aberrationIntensity * 0.6}),
        ${offsetY}px ${-offsetX}px 0 oklch(0.50 0.22 120 / ${aberrationIntensity * 0.5})
      `
    : 'none'

  return (
    <span
      className={cn('chromatic-aberration-text', className)}
      style={{ textShadow }}
    >
      {children}
    </span>
  )
}
