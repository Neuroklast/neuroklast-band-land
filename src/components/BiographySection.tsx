import { motion, useInView } from 'framer-motion'
import { PencilSimple, CaretLeft, CaretRight } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import BiographyEditDialog from '@/components/BiographyEditDialog'
import { useState, useRef, useEffect } from 'react'
import { useTypingEffect } from '@/hooks/use-typing-effect'
import { ChromaticText } from '@/components/ChromaticText'
import type { Biography } from '@/lib/types'
import bandDataJson from '@/assets/documents/band-data.json'

interface BiographySectionProps {
  biography?: Biography
  editMode?: boolean
  onUpdate?: (biography: Biography) => void
}

const defaultBiography: Biography = {
  story: bandDataJson.biography.story,
  founded: bandDataJson.biography.founded,
  members: bandDataJson.biography.members,
  achievements: bandDataJson.biography.achievements
}

export default function BiographySection({ biography = defaultBiography, editMode, onUpdate }: BiographySectionProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [photos, setPhotos] = useState<string[]>([])
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const [glitchActive, setGlitchActive] = useState(false)
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })

  const titleText = 'BIOGRAPHY'
  const { displayedText: displayedTitle } = useTypingEffect(
    isInView ? titleText : '',
    50,
    100
  )

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        setGlitchActive(true)
        setTimeout(() => setGlitchActive(false), 300)
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [])



  const handleUpdate = (updatedBiography: Biography) => {
    onUpdate?.(updatedBiography)
    setIsEditDialogOpen(false)
  }

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
    setTouchEnd(e.targetTouches[0].clientX)
    setIsSwiping(true)
    setSwipeDirection(null)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
    const diff = touchStart - e.targetTouches[0].clientX
    if (Math.abs(diff) > 10) {
      setSwipeDirection(diff > 0 ? 'left' : 'right')
    }
  }

  const handleTouchEnd = () => {
    setIsSwiping(false)
    const swipeThreshold = 75
    const swipeDistance = touchStart - touchEnd
    
    if (swipeDistance > swipeThreshold) {
      nextPhoto()
    } else if (swipeDistance < -swipeThreshold) {
      prevPhoto()
    }
    
    setSwipeDirection(null)
  }

  return (
    <section id="biography" ref={sectionRef} className="relative py-20 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
            <motion.h2 
              className={`text-4xl md:text-5xl text-foreground font-mono ${glitchActive ? 'glitch-text-effect' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <ChromaticText intensity={1.5}>
                &gt; {displayedTitle}
              </ChromaticText>
              <span className="animate-pulse">_</span>
            </motion.h2>
            {editMode && (
              <Button
                onClick={() => setIsEditDialogOpen(true)}
                variant="outline"
                size="sm"
                className="gap-2 active:scale-95 transition-transform touch-manipulation w-full sm:w-auto"
              >
                <PencilSimple size={16} />
                Edit
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="md:col-span-2 space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {photos.length > 0 && (
                <motion.div
                  className={`relative overflow-hidden rounded-lg aspect-square md:aspect-video group cursor-grab active:cursor-grabbing touch-manipulation ${glitchActive ? 'glitch-effect' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{
                    transform: isSwiping && swipeDirection 
                      ? swipeDirection === 'left' 
                        ? 'translateX(-4px)' 
                        : 'translateX(4px)'
                      : 'translateX(0)',
                    transition: isSwiping ? 'none' : 'transform 0.3s ease-out'
                  }}
                >
                  <img
                    src={photos[currentPhotoIndex]}
                    alt={`NEUROKLAST photo ${currentPhotoIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 select-none"
                    draggable={false}
                  />
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 group-active:border-primary transition-colors duration-300 rounded-lg cyber-border" />
                  <div className="absolute inset-0 bg-primary/0 group-active:bg-primary/5 transition-colors duration-150 pointer-events-none" />
                  
                  {photos.length > 1 && (
                    <>
                      <Button
                        onClick={prevPhoto}
                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 active:bg-background text-foreground backdrop-blur-sm w-12 h-12 md:w-14 md:h-14 p-0 opacity-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity active:scale-90 touch-manipulation"
                      >
                        <CaretLeft size={28} weight="bold" />
                      </Button>
                      <Button
                        onClick={nextPhoto}
                        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 active:bg-background text-foreground backdrop-blur-sm w-12 h-12 md:w-14 md:h-14 p-0 opacity-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity active:scale-90 touch-manipulation"
                      >
                        <CaretRight size={28} weight="bold" />
                      </Button>
                      <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-background/30 backdrop-blur-sm px-3 py-2 rounded-full">
                        {photos.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentPhotoIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all touch-manipulation active:scale-110 ${
                              index === currentPhotoIndex 
                                ? 'bg-primary w-8 shadow-lg shadow-primary/50' 
                                : 'bg-foreground/40 hover:bg-foreground/60 active:bg-foreground/80'
                            }`}
                            aria-label={`Go to photo ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              <Card className="bg-card border-border p-4 md:p-8 hover:border-primary/50 active:border-primary transition-all duration-300 touch-manipulation">
                <div className="prose prose-invert max-w-none">
                  {biography.story.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-sm md:text-base text-foreground/90 leading-relaxed mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Card>
            </motion.div>

            <div className="space-y-6">
              {biography.founded && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                >
                  <Card className="bg-card border-border p-6 hover:border-primary/50 transition-colors duration-300">
                    <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">
                      Founded
                    </h3>
                    <p className="text-2xl font-heading text-primary">{biography.founded}</p>
                  </Card>
                </motion.div>
              )}

              {biography.members && biography.members.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                >
                  <Card className="bg-card border-border p-6 hover:border-primary/50 transition-colors duration-300">
                    <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
                      Members
                    </h3>
                    <ul className="space-y-2">
                      {biography.members.map((member, index) => (
                        <li key={index} className="text-foreground/90">
                          {member}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </motion.div>
              )}

              {biography.achievements && biography.achievements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.7, delay: 0.5 }}
                >
                  <Card className="bg-card border-border p-6 hover:border-primary/50 transition-colors duration-300">
                    <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
                      Achievements
                    </h3>
                    <ul className="space-y-3">
                      {biography.achievements.map((achievement, index) => (
                        <li key={index} className="text-foreground/90 text-sm flex gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="flex-1">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {editMode && (
        <BiographyEditDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          biography={biography}
          onSave={handleUpdate}
        />
      )}
    </section>
  )
}
