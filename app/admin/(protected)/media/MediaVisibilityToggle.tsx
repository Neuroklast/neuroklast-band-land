'use client'

import { toggleMediaDownloadVisibility } from '@/app/admin/_actions/mediaDownloads'
import { AdminVisibilityToggle } from '@/app/admin/_components/AdminVisibilityToggle'

interface MediaVisibilityToggleProps {
  itemId: string
  active: boolean
}

export function MediaVisibilityToggle({ itemId, active }: MediaVisibilityToggleProps) {
  return (
    <AdminVisibilityToggle
      id={itemId}
      initialActive={active}
      onToggle={toggleMediaDownloadVisibility}
      hideLabel="Hide file on site"
      showLabel="Show file on site"
      hoverHighlight
    />
  )
}
