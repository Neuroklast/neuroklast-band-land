import { motion, useInView, AnimatePresence } from 'framer-motion'
import { PencilSimple, CaretLeft, CaretRight, User, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import BiographyEditDialog from '@/components/BiographyEditDialog'
import FontSizePicker from '@/components/FontSizePicker'
import ProgressiveImage from '@/components/ProgressiveImage'
import { loadCachedImage } from '@/lib/image-cache'
import { useState, useRef, useEffect } from 'react'
import { useTypingEffect } from '@/hooks/use-typing-effect'
import { ChromaticText } from '@/components/ChromaticText'
import type { Biography, Member, FontSizeSettings } from '@/lib/types'
import bandDataJson from '@/assets/documents/band-data.json'

interface BiographySectionProps {
  biography?: Biography
  editMode?: boolean
  onUpdate?: (biography: Biography) => void
  fontSizes?: FontSizeSettings
  onFontSizeChange?: (key: keyof FontSizeSettings, value: string) => void
}

const defaultBiography: Biography = {
  story: bandDataJson.biography.story,
  founded: bandDataJson.biography.founded,
  members: bandDataJson.biography.members,
  achievements: bandDataJson.biography.achievements
}

const normalizeMember = (m: string | Member): Member => typeof m === 'string' ? { name: m } : m

const profileLoadingTexts = [
  '> ACCESSING PROFILE...',
  '> DECRYPTING BIO...',
  '> IDENTITY VERIFIED',
]

function MemberProfileOverlay({ member, resolvePhoto, onClose }: {
  member: Member
  resolvePhoto: (url: string) => string
  onClose: () => void
}) {
  const [phase, setPhase] = useState<'loading' | 'glitch' | 'revealed'>('loading')
  const [loadingText, setLoadingText] = useState(profileLoadingTexts[0])

  useEffect(() => {
    let idx = 0
    const txtInterval = setInterval(() => {
      idx += 1
      if (idx < profileLoadingTexts.length) {
        setLoadingText(profileLoadingTexts[idx])
      }
    }, 300)

    const glitchTimer = setTimeout(() => {
      clearInterval(txtInterval)
      setPhase('glitch')
    }, 700)

    const revealTimer = setTimeout(() => setPhase('revealed'), 1000)

    return () => {
      clearInterval(txtInterval)
      clearTimeout(glitchTimer)
      clearTimeout(revealTimer)
    }
  }, [])

  return (
    <motion.div
      key="member-profile"
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Scanline overlay */}
      <div className="absolute inset-0 hud-scanline opacity-20 pointer-events-none" />

      {phase === 'loading' && (
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-16 h-1 bg-primary/30 overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              animate={{ width: ['0%', '100%'] }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
            />
          </div>
          <p className="text-primary/70 font-mono text-xs tracking-wider">{loadingText}</p>
        </motion.div>
      )}

      {phase !== 'loading' && (
        <motion.div
          className={`w-full max-w-md bg-card border rounded-lg overflow-hidden relative ${
            phase === 'glitch' ? 'border-primary red-glitch-element' : 'border-primary/30'
          }`}
          initial={{ scale: 0.85, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.85, y: 30, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* HUD corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/50" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/50" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/50" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/50" />

          <button
            className="absolute top-4 right-4 p-2 text-primary/60 hover:text-primary z-10"
            onClick={onClose}
            aria-label="Close profile"
          >
            <X size={24} />
          </button>

          <div className="flex flex-col items-center gap-5 p-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {member.photo ? (
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-2 border-primary/40 shadow-[0_0_30px_oklch(0.50_0.22_25/0.3)]">
                  <ProgressiveImage
                    src={resolvePhoto(member.photo)}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-muted flex items-center justify-center border-2 border-primary/40 shadow-[0_0_30px_oklch(0.50_0.22_25/0.3)]">
                  <User size={72} className="text-muted-foreground" />
                </div>
              )}
            </motion.div>

            <motion.h3
              className="text-2xl md:text-3xl font-bold font-mono"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <ChromaticText intensity={1.5}>{member.name}</ChromaticText>
            </motion.h3>

            {member.bio && (
              <motion.p
                className="text-sm md:text-base text-foreground/70 text-center leading-relaxed max-w-xs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                {member.bio}
              </motion.p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function BiographySection({ biography = defaultBiography, editMode, onUpdate, fontSizes, onFontSizeChange }: BiographySectionProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [photos, setPhotos] = useState<string[]>(biography.photos || [])
  const [cachedPhotos, setCachedPhotos] = useState<Record<string, string>>({})
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [glitchActive, setGlitchActive] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
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

  useEffect(() => {
    setPhotos(biography.photos || [])
  }, [biography.photos])

  // Cache URL-based biography photos and member photos
  useEffect(() => {
    const urlsToCache: string[] = []
    for (const p of photos) {
      if (p.startsWith('http') && !cachedPhotos[p]) urlsToCache.push(p)
    }
    for (const m of (biography.members || []).map(normalizeMember)) {
      if (m.photo && m.photo.startsWith('http') && !cachedPhotos[m.photo]) urlsToCache.push(m.photo)
    }
    for (const f of (biography.friends || [])) {
      if (f.photo && f.photo.startsWith('http') && !cachedPhotos[f.photo]) urlsToCache.push(f.photo)
    }
    urlsToCache.forEach((url) => {
      loadCachedImage(url).then((cached) => {
        setCachedPhotos((prev) => ({ ...prev, [url]: cached }))
      }).catch(() => { /* ignore failed cache attempts */ })
    })
  }, [photos, biography.members, biography.friends])

  const resolvePhoto = (url: string) => cachedPhotos[url] || url

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
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      nextPhoto()
    }
    if (touchStart - touchEnd < -75) {
      prevPhoto()
    }
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
            className={`text-4xl md:text-5xl lg:text-6xl font-bold font-mono scanline-text dot-matrix-text ${glitchActive ? 'glitch-text-effect' : ''}`}
            data-text={`> ${displayedTitle}`}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.6 }}
            style={{
              textShadow: '0 0 6px oklch(1 0 0 / 0.5), 0 0 12px oklch(0.50 0.22 25 / 0.3), 0 0 18px oklch(0.50 0.22 25 / 0.2)'
            }}
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

          {/* Full-width story card */}
          <div className="mb-6">
              {photos.length > 0 && (
                <motion.div
                  className={`relative overflow-hidden rounded-lg aspect-square md:aspect-video group mb-6 ${glitchActive ? 'glitch-effect' : ''}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <ProgressiveImage
                    src={resolvePhoto(photos[currentPhotoIndex])}
                    alt={`NEUROKLAST photo ${currentPhotoIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 transition-colors duration-300 rounded-lg cyber-border" />
                  
                  {photos.length > 1 && (
                    <>
                      <Button
                        onClick={prevPhoto}
                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 text-foreground backdrop-blur-sm w-10 h-10 md:w-12 md:h-12 p-0 opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 touch-manipulation"
                      >
                        <CaretLeft size={24} weight="bold" />
                      </Button>
                      <Button
                        onClick={nextPhoto}
                        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 text-foreground backdrop-blur-sm w-10 h-10 md:w-12 md:h-12 p-0 opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 touch-manipulation"
                      >
                        <CaretRight size={24} weight="bold" />
                      </Button>
                      <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {photos.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentPhotoIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all touch-manipulation ${
                              index === currentPhotoIndex 
                                ? 'bg-primary w-6' 
                                : 'bg-foreground/30 hover:bg-foreground/50'
                            }`}
                            aria-label={`Go to photo ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <Card className="bg-card border-border p-4 md:p-8 hover:border-primary/50 active:border-primary transition-all duration-300 touch-manipulation">
                  {editMode && onFontSizeChange && (
                    <div className="mb-3 flex gap-2 flex-wrap">
                      <FontSizePicker label="BIO" value={fontSizes?.biographyStory} onChange={(v) => onFontSizeChange('biographyStory', v)} />
                    </div>
                  )}
                  <div className="prose prose-invert max-w-none">
                    {biography.story.split('\n\n').map((paragraph, index) => (
                      <p key={index} className={`${fontSizes?.biographyStory || 'text-sm md:text-base'} text-foreground/90 leading-relaxed mb-4 last:mb-0`}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </Card>
              </motion.div>
          </div>

          {/* Grid for remaining cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

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
                    <div className="space-y-3">
                      {biography.members.map((rawMember, index) => {
                        const member = normalizeMember(rawMember)
                        return (
                          <button
                            key={index}
                            className="w-full text-left border border-border/50 rounded-lg p-3 hover:border-primary/30 transition-colors duration-200 cursor-pointer"
                            onClick={() => setSelectedMember(member)}
                            aria-label={`View profile of ${member.name}`}
                          >
                            <div className="flex items-center gap-3">
                              {member.photo ? (
                                <div className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ${glitchActive ? 'glitch-effect' : ''} red-tint`}>
                                  <ProgressiveImage
                                    src={resolvePhoto(member.photo)}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                  <User size={20} className="text-muted-foreground" />
                                </div>
                              )}
                              <span className="flex-1 text-foreground/90 font-medium">
                                <ChromaticText intensity={0.5}>{member.name}</ChromaticText>
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
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

      {/* Member profile overlay – cyberpunk glitch entrance */}
      <AnimatePresence>
        {selectedMember && (
          <MemberProfileOverlay
            member={selectedMember}
            resolvePhoto={resolvePhoto}
            onClose={() => setSelectedMember(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
