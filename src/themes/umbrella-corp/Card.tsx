import { Card as ShadcnCard } from '@/components/ui/card'
import type { CardSlotProps } from '@/lib/types'

export default function Card({ children, className = '' }: CardSlotProps) {
  return (
    <ShadcnCard className={`umbrella-corp-card relative ${className}`}>
      {children}
    </ShadcnCard>
  )
}
