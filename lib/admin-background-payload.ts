import type { MobileVideoMode } from '@/lib/background-config'
import type { PublicBackgroundType } from '@/lib/public-background-types'

export interface BackgroundEditorFields {
  imageStoragePath: string
  imageUrl: string
  videoStoragePath: string
  videoUrl: string
  mobileVideoStoragePath: string
  mobileVideoUrl: string
  mobileVideoMode: MobileVideoMode
  backgroundType: PublicBackgroundType
  backgroundImageOpacity: number
  backgroundVideoOpacity: number
  backgroundVideoEnabled: boolean
}

/**
 * Preserve the original live-preview contract: empty paths/URLs are undefined,
 * not null. JSON.stringify omits them, so this must not be reused for persistence.
 */
export function composeBackgroundPreview(fields: BackgroundEditorFields) {
  return {
    storage_path: fields.imageStoragePath || undefined,
    url: fields.imageUrl || undefined,
    video_storage_path: fields.videoStoragePath || undefined,
    video_url: fields.videoUrl || undefined,
    video_mobile_storage_path: fields.mobileVideoStoragePath || undefined,
    video_mobile_url: fields.mobileVideoUrl || undefined,
    mobileVideoMode: fields.mobileVideoMode,
    backgroundType: fields.backgroundType,
    backgroundImageOpacity: fields.backgroundImageOpacity,
    backgroundVideoOpacity: fields.backgroundVideoOpacity,
    backgroundVideoEnabled: fields.backgroundVideoEnabled,
  }
}

/**
 * The persisted payload differs intentionally: paths/URLs are explicit nulls,
 * and mobile assets are cleared unless a separate mobile video is selected.
 */
export function composeBackgroundSave(fields: BackgroundEditorFields) {
  return {
    storage_path: fields.imageStoragePath || null,
    url: fields.imageUrl || null,
    video_storage_path: fields.videoStoragePath || null,
    video_url: fields.videoUrl || null,
    video_mobile_storage_path: fields.mobileVideoMode === 'separate'
      ? fields.mobileVideoStoragePath || null : null,
    video_mobile_url: fields.mobileVideoMode === 'separate'
      ? fields.mobileVideoUrl || null : null,
    mobileVideoMode: fields.mobileVideoMode,
    backgroundType: fields.backgroundType,
    backgroundImageOpacity: fields.backgroundImageOpacity,
    backgroundVideoOpacity: fields.backgroundVideoOpacity,
    backgroundVideoEnabled: fields.backgroundVideoEnabled,
  }
}
