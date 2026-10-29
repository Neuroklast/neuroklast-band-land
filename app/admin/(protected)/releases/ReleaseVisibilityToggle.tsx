'use client'

import { toggleReleaseVisibility } from '@/app/admin/_actions/releases'
import { AdminVisibilityToggle } from '@/app/admin/_components/AdminVisibilityToggle'

interface ReleaseVisibilityToggleProps {
  releaseId: string
  active: boolean
}

export function ReleaseVisibilityToggle({ releaseId, active }: ReleaseVisibilityToggleProps) {
  return (
    <AdminVisibilityToggle
      id={releaseId}
      initialActive={active}
      onToggle={toggleReleaseVisibility}
      hideLabel="Hide release on site"
      showLabel="Show release on site"
      hoverHighlight
    />
  )
}
