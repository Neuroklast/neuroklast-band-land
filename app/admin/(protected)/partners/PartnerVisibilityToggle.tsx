'use client'

import { togglePartnerVisibility } from '@/app/admin/_actions/partners'
import { AdminVisibilityToggle } from '@/app/admin/_components/AdminVisibilityToggle'

interface PartnerVisibilityToggleProps {
  partnerId: string
  active: boolean
}

export function PartnerVisibilityToggle({ partnerId, active }: PartnerVisibilityToggleProps) {
  return (
    <AdminVisibilityToggle
      id={partnerId}
      initialActive={active}
      onToggle={togglePartnerVisibility}
      hideLabel="Hide on site"
      showLabel="Show on site"
    />
  )
}
