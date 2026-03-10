import { ReactNode } from 'react'
import type { CardSlotProps } from '@/lib/types'

export default function Card({ children, className = '', href, onClick }: CardSlotProps) {
  const CardComponent = href ? 'a' : onClick ? 'button' : 'div'

  const props = {
    className: `signal-static-card relative bg-card border border-border p-6 group hover:border-accent transition-all duration-300 block text-left ${className}`,
    ...(href ? { href } : {}),
    ...(onClick ? { onClick } : {})
  }

  return (
    <CardComponent {...(props as any)}>
      <div className="signal-static-card-noise"></div>
      <div className="signal-static-card-corner signal-static-card-corner-tl"></div>
      <div className="signal-static-card-corner signal-static-card-corner-tr"></div>
      <div className="signal-static-card-corner signal-static-card-corner-bl"></div>
      <div className="signal-static-card-corner signal-static-card-corner-br"></div>
      
      <div className="relative z-10">
        {children}
      </div>
      
      <div className="signal-static-card-glitch"></div>
    </CardComponent>
  )
}
