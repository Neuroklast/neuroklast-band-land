/**
 * DefaultGallerySectionSlot — default GallerySection slot fallback.
 *
 * Delegates to the real InstagramGallery component, passing through all slot props.
 */

import InstagramGallery from '@/components/InstagramGallery'
import type { GallerySectionSlotProps } from '@/lib/types'

export default function DefaultGallerySectionSlot(props: GallerySectionSlotProps) {
  return (
    <InstagramGallery
      galleryImages={props.galleryImages}
      sectionLabels={props.sectionLabels}
      editMode={props.editMode}
      siteName={props.siteName}
      driveFolderUrl={props.driveFolderUrl}
      onDriveFolderUrlChange={props.onDriveFolderUrlChange}
      onUpdate={props.onUpdate}
      onLabelChange={props.onLabelChange}
    />
  )
}

DefaultGallerySectionSlot.displayName = 'DefaultGallerySection'
