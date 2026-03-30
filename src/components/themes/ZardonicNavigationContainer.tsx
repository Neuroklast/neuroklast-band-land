import { useState } from 'react'
import Navigation from '../../themes/zardonic-industrial/Navigation'
import type { NavigationSlotProps } from '@/lib/types'

export default function ZardonicNavigationContainer(props: NavigationSlotProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <Navigation
      {...props}
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
    />
  )
}
