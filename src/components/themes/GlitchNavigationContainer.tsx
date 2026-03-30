import { useState } from 'react'
import Navigation from '../../themes/glitch-noir/Navigation'
import type { NavigationSlotProps } from '@/lib/types'

export default function GlitchNavigationContainer(props: NavigationSlotProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Navigation
      {...props}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    />
  )
}
