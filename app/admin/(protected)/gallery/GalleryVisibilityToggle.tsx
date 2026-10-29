'use client'

import { toggleGalleryImageVisibility } from '@/app/admin/_actions/gallery'
import { AdminVisibilityToggle } from '@/app/admin/_components/AdminVisibilityToggle'

interface GalleryVisibilityToggleProps {
  imageId: string
  active: boolean
}

export function GalleryVisibilityToggle({ imageId, active }: GalleryVisibilityToggleProps) {
  return (
    <AdminVisibilityToggle
      id={imageId}
      initialActive={active}
      onToggle={toggleGalleryImageVisibility}
      hideLabel="Hide image on site"
      showLabel="Show image on site"
      hoverHighlight
    />
  )
}
