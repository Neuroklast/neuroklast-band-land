'use client'

import { toggleMemberVisibility } from '@/app/admin/_actions/members'
import { AdminVisibilityToggle } from '@/app/admin/_components/AdminVisibilityToggle'

interface MemberVisibilityToggleProps {
  memberId: string
  active: boolean
}

export function MemberVisibilityToggle({ memberId, active }: MemberVisibilityToggleProps) {
  return (
    <AdminVisibilityToggle
      id={memberId}
      initialActive={active}
      onToggle={toggleMemberVisibility}
      hideLabel="Hide on site"
      showLabel="Show on site"
    />
  )
}
