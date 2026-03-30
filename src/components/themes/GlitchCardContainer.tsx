import { useState } from 'react'
import Card from '../../themes/glitch-noir/Card'

export default function GlitchCardContainer({ children }: { children: React.ReactNode }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card isHovered={isHovered}>{children}</Card>
    </div>
  )
}
