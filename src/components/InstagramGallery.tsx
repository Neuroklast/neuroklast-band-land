import { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Images, X } from '@phosphor-icons/react'
import { useTypingEffect } from '@/hooks/use-typing-effect'
import { ChromaticText } from '@/components/ChromaticText'

const galleryModules = import.meta.glob('/src/assets/images/gallery/*.{jpg,jpeg,png,gif,webp}', { eager: true })

export default function InstagramGallery() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const [glitchIndex, setGlitchIndex] = useState<number | null>(null)
  const [selectedImage, setSelectedImage] = useState<{ imageUrl: string; caption: string } | null>(null)

  const titleText = 'GALLERY'
  const { displayedText: displayedTitle } = useTypingEffect(
    isInView ? titleText : '',
    50,
    200
  )

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && photos.length > 0) {
        const randomIndex = Math.floor(Math.random() * photos.length)
        setGlitchIndex(randomIndex)
        setTimeout(() => setGlitchIndex(null), 300)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedImage])

  const photos = Object.entries(galleryModules).map(([path, module]: [string, any], index) => {
    const filename = path.split('/').pop()?.split('.')[0] || `image-${index}`
    return {
      id: `gallery-${index}`,
      imageUrl: module.default as string,
      caption: 'NK//00' + index
    }
  })

  return (
    <>
      <section 
        id="gallery" 
        ref={sectionRef}
        className="py-20 px-4 relative"
      >
        <div className="max-w-6xl mx-auto">
           <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="glitch-effect"
              >
                <Images size={32} className="text-primary" weight="fill" />
              </motion.div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-mono scanline-text dot-matrix-text"

                style={{
                  textShadow: '0 0 6px oklch(1 0 0 / 0.5), 0 0 12px oklch(0.50 0.22 25 / 0.3), 0 0 18px oklch(0.50 0.22 25 / 0.2)'
                }}
              >
                <ChromaticText intensity={1.5}>
                  {displayedTitle}
                </ChromaticText>
                <span className="animate-pulse">_</span>
              </h2>
            </div>
            <p className="text-muted-foreground font-mono text-sm">
              &gt; Visual identity of NEUROKLAST
            </p>
          </motion.div>
          {photos.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <p className="font-mono">&gt; No images found in gallery folder</p>
              <p className="font-mono text-xs mt-2">&gt; Add images to /src/assets/images/gallery/</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                className={`relative group overflow-hidden bg-card aspect-square cursor-pointer touch-manipulation hud-element hud-corner hud-scanline ${glitchIndex === index ? 'red-glitch-element' : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedImage(photo)}
              >
                <span className="corner-bl"></span>
                <span className="corner-br"></span>
                
                <div className="absolute top-2 left-2 z-10 data-readout">
                  IMG_{String(index).padStart(3, '0')}
                </div>
                
                <div className="absolute top-2 right-2 z-10">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ boxShadow: '0 0 8px oklch(0.50 0.22 25)' }}></div>
                </div>
                
                <div className="relative w-full h-full red-tint-strong">
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-active:scale-105"
                    loading="lazy"
                    style={{ filter: 'contrast(1.1) brightness(0.9)' }}
                  />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 z-10">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 text-white hud-text">
                      <Images size={20} weight="fill" className="text-primary" />
                      <span className="text-xs font-mono line-clamp-2">{photo.caption}</span>
                    </div>
                    <div className="mt-2 flex gap-2 text-[9px] text-primary/60">
                      <span>SECTOR: {String.fromCharCode(65 + (index % 26))}</span>
                      <span>•</span>
                      <span>STATUS: ACTIVE</span>
                    </div>
                  </div>
                </div>
                
                <div className="absolute inset-0 border border-transparent group-hover:border-primary/50 group-active:border-primary transition-colors duration-300 hud-border-glow pointer-events-none" />
                <div className="absolute inset-0 bg-primary/0 group-active:bg-primary/10 transition-colors duration-150 pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md px-4 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.button
              className="absolute top-4 right-4 p-3 bg-primary/20 hover:bg-primary/30 active:bg-primary/40 border border-primary/40 hover:border-primary/60 transition-all z-50 touch-manipulation group"
              onClick={() => setSelectedImage(null)}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={24} className="text-primary group-hover:text-primary/80" weight="bold" />
            </motion.button>

            <motion.div
              className="relative max-w-7xl max-h-full hud-corner hud-element"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="corner-bl"></span>
              <span className="corner-br"></span>

              <div className="absolute top-2 left-2 z-10 data-readout bg-black/50 px-2 py-1">
                ZOOM_VIEW
              </div>

              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.caption}
                className="max-w-full max-h-[85vh] w-auto h-auto object-contain red-tint"
                style={{ filter: 'contrast(1.1) brightness(0.9)' }}
              />

              <div className="absolute bottom-4 left-4 right-4 bg-black/80 border border-primary/40 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-white hud-text">
                  <Images size={20} weight="fill" className="text-primary" />
                  <span className="text-sm font-mono">{selectedImage.caption}</span>
                </div>
              </div>
            </motion.div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-muted-foreground/60 font-mono text-xs">
              <p>&gt; Click outside to close</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
