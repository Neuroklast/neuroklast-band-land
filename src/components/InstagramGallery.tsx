import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { Images } from '@phosphor-icons/react'
import { useTypingEffect } from '@/hooks/use-typing-effect'
import { ChromaticText } from '@/components/ChromaticText'

const galleryModules = import.meta.glob('/src/assets/images/gallery/*.{jpg,jpeg,png,gif,webp}', { eager: true })

export default function InstagramGallery() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const [glitchIndex, setGlitchIndex] = useState<number | null>(null)

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

  const photos = Object.entries(galleryModules).map(([path, module]: [string, any], index) => {
    const filename = path.split('/').pop()?.split('.')[0] || `image-${index}`
    return {
      id: `gallery-${index}`,
      imageUrl: module.default as string,
      caption: 'NK//00' + index
    }
  })

  return (
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
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-mono">
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
              className={`relative group overflow-hidden rounded-md bg-card aspect-square ${glitchIndex === index ? 'glitch-effect' : ''}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <img
                src={photo.imageUrl}
                alt={photo.caption}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 text-white">
                    <Images size={20} weight="fill" />
                    <span className="text-xs font-mono line-clamp-2">{photo.caption}</span>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 transition-colors duration-300 rounded-md cyber-border" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
