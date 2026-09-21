'use client'

import { createContext, useContext } from 'react'
import { DEFAULT_IMAGE_CDN_MODE, type ImageCdnMode } from '@/lib/image-cdn'

const ImageCdnContext = createContext<ImageCdnMode>(DEFAULT_IMAGE_CDN_MODE)

/** Publishes the admin-selected image CDN mode to every client image component. */
export function ImageCdnProvider({
  mode,
  children,
}: {
  mode: ImageCdnMode
  children: React.ReactNode
}) {
  return <ImageCdnContext.Provider value={mode}>{children}</ImageCdnContext.Provider>
}

export function useImageCdnMode(): ImageCdnMode {
  return useContext(ImageCdnContext)
}
