import { useState } from 'react'
import Navigation from '../../themes/umbrella-corp/Navigation'
import type { NavigationSlotProps } from '@/lib/types'

export default function UmbrellaNavigationContainer(props: NavigationSlotProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <Navigation
      {...props}
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
    />
  )
}
