'use client'

import { Card as ShadcnCard } from '@/components/ui/card'
import type { CardSlotProps } from '@/lib/types'

interface CardProps extends CardSlotProps {
  onClick?: () => void
  dataLabel?: string
  hoverable?: boolean
  scanEffect?: boolean
}

export default function Card({
  children,
  className = '',
  onClick,
  dataLabel,
  hoverable = true,
  scanEffect = false,
}: CardProps) {
  return (
    <ShadcnCard
      className={`
        bg-card
        border-border
        ${hoverable ? 'hover:border-primary/50 transition-colors cursor-pointer' : ''}
        ${scanEffect ? 'neuroklast-theme-hover-scan' : ''}
        neuroklast-theme-cyber-card
        neuroklast-theme-hover-noise
        relative
        ${className}
      `}
      onClick={onClick}
    >
      {scanEffect && <div className="neuroklast-theme-scan-line" />}
      {dataLabel && (
        <div className="neuroklast-theme-data-label mb-2">{dataLabel}</div>
      )}
      {children}
    </ShadcnCard>
  )
}
