import { motion, useInView } from 'framer-motion'
import { Separator } from '@/components/ui/separator'
import { useState, useRef, useEffect, useCallback } from 'react'

interface PhotoItem {
  src: string
  name: string
}

export default function GallerySection() {
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null)
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.05 })

  useEffect(() => {
    fetch('/photos/photos.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load photos manifest')
        return res.json()
      })
      .then((files: string[]) => {
        const imageFiles = files
          .filter(name => /\.(jpg|jpeg|png|gif|webp)$/i.test(name))
          .map(name => ({
            src: `/photos/${name}`,
            name: name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
          }))
        setPhotos(imageFiles)
      })
      .catch(() => {
        setPhotos([])
      })
  }, [])

  const closeLightbox = useCallback(() => {
    setSelectedPhoto(null)
  }, [])

  useEffect(() => {
    if (!selectedPhoto) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedPhoto, closeLightbox])

  if (photos.length === 0) return null

  return (
    <section ref={sectionRef} className="py-24 px-4 bg-gradient-to-b from-background to-secondary/5" id="gallery">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-12"
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.6 }}
        >
          GALLERY
        </motion.h2>

        <Separator className="bg-gradient-to-r from-primary via-primary/50 to-transparent mb-12 h-0.5" />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.src}
              className="aspect-square overflow-hidden rounded-lg cursor-pointer group relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.src}
                alt={photo.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>
      </div>

      {selectedPhoto && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={closeLightbox}
          role="dialog"
          aria-label="Photo lightbox"
        >
          <motion.img
            src={selectedPhoto.src}
            alt={selectedPhoto.name}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      )}
    </section>
  )
}
