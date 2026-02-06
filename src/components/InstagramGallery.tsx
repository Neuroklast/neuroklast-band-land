import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Images } from '@phosphor-icons/react'
import bandPhotoAI from '@/assets/images/NK_AI.jpeg'
import bandPhotoBaphomet from '@/assets/images/NK_BAPHOMET.png'

export default function InstagramGallery() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })

  const photos = [
    {
      id: '1',
      imageUrl: bandPhotoAI,
      caption: 'NEUROKLAST AI'
    },
    {
      id: '2',
      imageUrl: bandPhotoBaphomet,
      caption: 'NEUROKLAST BAPHOMET'
    }
  ]

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
            <Images size={32} className="text-primary" weight="fill" />
            <h2 className="text-4xl md:text-5xl lg:text-6xl">Gallery</h2>
          </div>
          <p className="text-muted-foreground">
            Visual identity of NEUROKLAST
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              className="relative group overflow-hidden rounded-md bg-card aspect-square"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <img
                src={photo.imageUrl}
                alt={photo.caption}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 text-white">
                    <Images size={20} weight="fill" />
                    <span className="text-sm line-clamp-2">{photo.caption}</span>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 transition-colors duration-300 rounded-md" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
