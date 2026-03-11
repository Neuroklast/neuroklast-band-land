import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`signal-static-card relative bg-card border border-border p-6 group hover:border-accent transition-all duration-300 ${className}`}>
      <div className="signal-static-card-noise"></div>
      <div className="signal-static-card-corner signal-static-card-corner-tl"></div>
      <div className="signal-static-card-corner signal-static-card-corner-tr"></div>
      <div className="signal-static-card-corner signal-static-card-corner-bl"></div>
      <div className="signal-static-card-corner signal-static-card-corner-br"></div>
      
      <div className="relative z-10">
        {children}
      </div>
      
      <div className="signal-static-card-glitch"></div>
    </div>
  )
}
