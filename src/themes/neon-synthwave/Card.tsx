import React from 'react'
import type { CardSlotProps } from '@/lib/types'

export default function Card({ children, className = '' }: CardSlotProps) {
  const baseClasses = 'card-container p-6'
  const hoverClasses = 'hover:scale-[1.02]'

  const variantClasses = 'bg-card'

  return (
    <div className={`${baseClasses} ${hoverClasses} ${variantClasses} ${className}`}>
      {children}
    </div>
  )
}
