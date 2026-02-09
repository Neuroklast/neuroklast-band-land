import { motion, useInView, AnimatePresence } from 'framer-motion'
import { PencilSimple, CaretLeft, CaretRight, User } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import BiographyEditDialog from '@/components/BiographyEditDialog'
import FontSizePicker from '@/components/FontSizePicker'
import ProgressiveImage from '@/components/ProgressiveImage'
import CyberCloseButton from '@/components/CyberCloseButton'
import { loadCachedImage, toDirectImageUrl } from '@/lib/image-cache'
import { useState, useRef, useEffect } from 'react'
import { useTypingEffect } from '@/hooks/use-typing-effect'
import { ChromaticText } from '@/components/ChromaticText'
import type { Biography, Member, FontSizeSettings, SectionLabels } from '@/lib/types'
import bandDataJson from '@/assets/documents/band-data.json'
import {
  CONSOLE_LINES_DEFAULT_SPEED_MS,
  CONSOLE_LINES_DEFAULT_DELAY_MS,
  CONSOLE_TYPING_SPEED_MS,
  CONSOLE_LINE_DELAY_MS,
  PROFILE_LOADING_TEXT_INTERVAL_MS,
  PROFILE_GLITCH_PHASE_DELAY_MS,
  PROFILE_REVEAL_PHASE_DELAY_MS,
  TITLE_TYPING_SPEED_MS,
  TITLE_TYPING_START_DELAY_MS,
  SECTION_GLITCH_PROBABILITY,
  SECTION_GLITCH_DURATION_MS,
  SECTION_GLITCH_INTERVAL_MS,
  TOUCH_SWIPE_THRESHOLD_PX,
} from '@/lib/config'

interface BiographySectionProps {
  biography?: Biography
  editMode?: boolean
  onUpdate?: (biography: Biography) => void
  fontSizes?: FontSizeSettings
  onFontSizeChange?: (key: keyof FontSizeSettings, value: string) => void
  sectionLabels?: SectionLabels
  onLabelChange?: (key: keyof SectionLabels, value: string) => void
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

/** Terminal-style line-by-line text reveal */
function ConsoleLines({ lines, speed = CONSOLE_LINES_DEFAULT_SPEED_MS, delayBetween = CONSOLE_LINES_DEFAULT_DELAY_MS }: { lines: string[]; speed?: number; delayBetween?: number }) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [lineComplete, setLineComplete] = useState(false)

  useEffect(() => {
    if (visibleCount >= lines.length) return
    const line = lines[visibleCount]
    let charIdx = 0
    setCurrentText('')
    setLineComplete(false)
    const interval = setInterval(() => {
      charIdx++
      if (charIdx <= line.length) {
        setCurrentText(line.slice(0, charIdx))
      } else {
        clearInterval(interval)
        setLineComplete(true)
        setTimeout(() => setVisibleCount((c) => c + 1), delayBetween)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [visibleCount, lines, speed, delayBetween])

  return (
    <div className="space-y-1">
      {lines.slice(0, visibleCount).map((line, i) => (
        <p key={i} className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">{line}</p>
      ))}
      {visibleCount < lines.length && (
        <p className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">
          {currentText}
          {!lineComplete && <span className="console-cursor" />}
        </p>
      )}
    </div>
  )
}

function MemberProfileOverlay({ member, resolvePhoto, onClose, sectionLabels }: {
  member: Member
  resolvePhoto: (url: string) => string
  onClose: () => void
  sectionLabels?: SectionLabels
}) {
  const [phase, setPhase] = useState<'loading' | 'glitch' | 'revealed'>('loading')
  const [loadingText, setLoadingText] = useState(profileLoadingTexts[0])
  const [photoLoaded, setPhotoLoaded] = useState(false)
  const [photoSrc, setPhotoSrc] = useState('')
  const proxyAttempted = useRef(false)

  // Resolve photo URL robustly: use cached version or transform to direct URL
  useEffect(() => {
    if (!member.photo) return
    const cached = resolvePhoto(member.photo)
    if (cached && cached !== member.photo) {
      setPhotoSrc(cached)
    } else {
      setPhotoSrc(toDirectImageUrl(member.photo))
    }
  }, [member.photo, resolvePhoto])

  useEffect(() => {
    let idx = 0
    const txtInterval = setInterval(() => {
      idx += 1
      if (idx < profileLoadingTexts.length) {
        setLoadingText(profileLoadingTexts[idx])
      }
    }, PROFILE_LOADING_TEXT_INTERVAL_MS)

    const glitchTimer = setTimeout(() => {
      clearInterval(txtInterval)
      setPhase('glitch')
    }, PROFILE_GLITCH_PHASE_DELAY_MS)

    const revealTimer = setTimeout(() => setPhase('revealed'), PROFILE_REVEAL_PHASE_DELAY_MS)

    return () => {
      clearInterval(txtInterval)
      clearTimeout(glitchTimer)
      clearTimeout(revealTimer)
    }
  }, [])

  // Build terminal-style data lines for the console effect
  const dataLines: string[] = []
  dataLines.push(`> SUBJECT: ${member.name.toUpperCase()}`)
  // Add custom profile fields if defined, otherwise use defaults
  const profileFields = sectionLabels?.profileFields
  if (profileFields && profileFields.length > 0) {
    profileFields.forEach(field => {
      dataLines.push(`> ${field.label}: ${field.value}`)
    })
  } else {
    dataLines.push(`> STATUS: ${sectionLabels?.profileStatusText || 'ACTIVE'}`)
  }
  if (member.bio) {
    dataLines.push('> ---')
    dataLines.push(`> ${member.bio}`)
  }
  dataLines.push('> ---')
  if (!profileFields || profileFields.length === 0) {
    dataLines.push('> CLEARANCE: GRANTED')
  }

  return (
    <motion.div
      key="member-profile"
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6"
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
          className={`w-full max-w-3xl max-h-[90dvh] bg-card border relative overflow-y-auto overflow-x-hidden glitch-overlay-enter ${
            phase === 'glitch' ? 'border-primary red-glitch-element' : 'border-primary/30'
          }`}
          initial={{ scale: 0.85, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.85, y: 30, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* HUD corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/50 pointer-events-none" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/50 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/50 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/50 pointer-events-none" />

          {/* Header bar with integrated close button */}
          <div className="sticky top-0 z-20 h-10 bg-primary/10 border-b border-primary/30 flex items-center justify-between px-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
              <span className="font-mono text-[10px] text-primary/70 tracking-wider uppercase truncate">PROFILE // {member.name.toUpperCase()}</span>
            </div>
            <CyberCloseButton
              onClick={onClose}
              label={sectionLabels?.closeButtonText || 'CLOSE'}
              className="flex-shrink-0 ml-2"
            />
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Left: Photo with angular frame and loading bar */}
            <div className="md:w-2/5 p-4 md:p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-primary/20">
              <motion.div
                className="relative w-full max-w-[180px] sm:max-w-[220px] aspect-square"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {member.photo && photoSrc ? (
                  <div className="w-full h-full overflow-hidden border border-primary/40 shadow-[0_0_20px_oklch(0.50_0.22_25/0.3),0_0_40px_oklch(0.50_0.22_25/0.15)] bg-black">
                    {!photoLoaded && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-[1] bg-black">
                        <div className="w-3/4 h-[2px] bg-primary/20 overflow-hidden mb-1">
                          <div className="h-full bg-primary animate-progress-bar" />
                        </div>
                        <p className="text-[8px] font-mono text-primary/40 tracking-wider">LOADING IMG...</p>
                      </div>
                    )}
                    <img
                      src={photoSrc}
                      alt={member.name}
                      className="w-full h-full object-contain"
                      style={{ opacity: photoLoaded ? 1 : 0, transition: 'opacity 0.3s ease-in' }}
                      onLoad={() => setPhotoLoaded(true)}
                      onError={() => {
                        // Fallback: try server-side proxy once
                        if (member.photo && !proxyAttempted.current) {
                          proxyAttempted.current = true
                          const directUrl = toDirectImageUrl(member.photo)
                          setPhotoSrc(`/api/image-proxy?url=${encodeURIComponent(directUrl)}`)
                        }
                      }}
                    />
                    {/* Scanline on photo */}
                    <div className="absolute inset-0 hud-scanline pointer-events-none opacity-20" />
                    {/* Dot-matrix on photo */}
                    <div className="dot-matrix-photo" />
                  </div>
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center border border-primary/40">
                    <User size={72} className="text-muted-foreground" />
                  </div>
                )}
                {/* Corner brackets on photo */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/60" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/60" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary/60" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/60" />
              </motion.div>
            </div>

            {/* Right: Terminal-style data readout with console typing effect */}
            <div className="md:w-3/5 p-4 md:p-6">
              <motion.div
                className="font-mono space-y-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="text-[10px] text-primary/50 tracking-wider mb-3">
                  {'>'} TERMINAL OUTPUT // PROFILE DATA
                </div>
                <div className="bg-black/50 border border-primary/20 p-4 max-h-[200px] overflow-y-auto">
                  <ConsoleLines lines={dataLines} speed={CONSOLE_TYPING_SPEED_MS} delayBetween={CONSOLE_LINE_DELAY_MS} />
                </div>
                <div className="flex items-center gap-2 text-[9px] text-primary/40 pt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
                  <span>{sectionLabels?.sessionStatusText || 'SESSION ACTIVE'}</span>
                  <span className="ml-auto">NK-SYS v1.3.37</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function BiographySection({ biography = defaultBiography, editMode, onUpdate, fontSizes, onFontSizeChange, sectionLabels, onLabelChange }: BiographySectionProps) {
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

  const titleText = sectionLabels?.biography || 'BIOGRAPHY'
  const headingPrefix = sectionLabels?.headingPrefix ?? '>'
  const { displayedText: displayedTitle } = useTypingEffect(
    isInView ? titleText : '',
    TITLE_TYPING_SPEED_MS,
    TITLE_TYPING_START_DELAY_MS
  )

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > SECTION_GLITCH_PROBABILITY) {
        setGlitchActive(true)
        setTimeout(() => setGlitchActive(false), SECTION_GLITCH_DURATION_MS)
      }
    }, SECTION_GLITCH_INTERVAL_MS)

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
    if (touchStart - touchEnd > TOUCH_SWIPE_THRESHOLD_PX) {
      nextPhoto()
    }
    if (touchStart - touchEnd < -TOUCH_SWIPE_THRESHOLD_PX) {
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
            data-text={`${headingPrefix} ${displayedTitle}`}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.6 }}
            style={{
              textShadow: '0 0 6px oklch(1 0 0 / 0.5), 0 0 12px oklch(0.50 0.22 25 / 0.3), 0 0 18px oklch(0.50 0.22 25 / 0.2)'
            }}
          >
            <ChromaticText intensity={1.5}>
              {headingPrefix} {displayedTitle}
            </ChromaticText>
            <span className="animate-pulse">_</span>
          </motion.h2>
            {editMode && (
              <div className="flex gap-2 items-center w-full sm:w-auto">
                {onLabelChange && (
                  <>
                    <input
                      type="text"
                      value={sectionLabels?.headingPrefix ?? '>'}
                      onChange={(e) => onLabelChange('headingPrefix', e.target.value)}
                      placeholder=">"
                      className="bg-transparent border border-primary/30 px-2 py-1 text-xs font-mono text-primary w-12 focus:outline-none focus:border-primary"
                      title="Heading prefix"
                    />
                    <input
                      type="text"
                      value={sectionLabels?.biography || ''}
                      onChange={(e) => onLabelChange('biography', e.target.value)}
                      placeholder="BIOGRAPHY"
                      className="bg-transparent border border-primary/30 px-2 py-1 text-xs font-mono text-primary w-32 focus:outline-none focus:border-primary"
                    />
                  </>
                )}
                <Button
                  onClick={() => setIsEditDialogOpen(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2 active:scale-95 transition-transform touch-manipulation"
                >
                  <PencilSimple size={16} />
                  Edit
                </Button>
              </div>
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

          {/* Grid for MEMBERS, COLLABS, ACHIEVEMENTS side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {biography.members && biography.members.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
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

              {biography.collabs && biography.collabs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                >
                  <Card className="bg-card border-border p-6 hover:border-primary/50 transition-colors duration-300">
                    <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
                      {sectionLabels?.collabs || 'Collabs'}
                    </h3>
                    <ul className="space-y-3">
                      {biography.collabs.map((collab, index) => (
                        <li key={index} className="text-foreground/90 text-sm flex gap-2">
                          <span className="text-primary mt-1">◆</span>
                          <span className="flex-1">{collab}</span>
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
            sectionLabels={sectionLabels}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
