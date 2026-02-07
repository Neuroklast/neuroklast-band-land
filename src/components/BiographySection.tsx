import { motion, useInView, AnimatePresence } from 'framer-motion'
import { PencilSimple, CaretLeft, CaretRight, User, CaretDown, Plus, Trash, InstagramLogo, FacebookLogo, SpotifyLogo, SoundcloudLogo, YoutubeLogo, MusicNote, Globe, Link } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import BiographyEditDialog from '@/components/BiographyEditDialog'
import FontSizePicker from '@/components/FontSizePicker'
import ProgressiveImage from '@/components/ProgressiveImage'
import { useState, useRef, useEffect } from 'react'
import { useTypingEffect } from '@/hooks/use-typing-effect'
import { ChromaticText } from '@/components/ChromaticText'
import type { Biography, Member, Friend, FontSizeSettings } from '@/lib/types'
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

const friendSocialIcons: { key: keyof NonNullable<Friend['socials']>; icon: any; label: string }[] = [
  { key: 'instagram', icon: InstagramLogo, label: 'Instagram' },
  { key: 'facebook', icon: FacebookLogo, label: 'Facebook' },
  { key: 'spotify', icon: SpotifyLogo, label: 'Spotify' },
  { key: 'soundcloud', icon: SoundcloudLogo, label: 'SoundCloud' },
  { key: 'youtube', icon: YoutubeLogo, label: 'YouTube' },
  { key: 'bandcamp', icon: MusicNote, label: 'Bandcamp' },
  { key: 'website', icon: Globe, label: 'Website' },
]

function FriendCard({ friend, editMode, onUpdate, onDelete }: {
  friend: Friend
  editMode?: boolean
  onUpdate: (friend: Friend) => void
  onDelete: () => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(friend)

  const handleSave = () => {
    onUpdate(editData)
    setIsEditing(false)
  }

  if (isEditing && editMode) {
    return (
      <Card className="bg-card border-primary/30 p-4 space-y-3">
        <div className="space-y-2">
          <div>
            <Label className="text-[10px]">Name</Label>
            <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="text-xs h-8" />
          </div>
          <div>
            <Label className="text-[10px]">Photo URL</Label>
            <Input value={editData.photo || ''} onChange={(e) => setEditData({ ...editData, photo: e.target.value })} className="text-xs h-8" placeholder="https://..." />
          </div>
          <div>
            <Label className="text-[10px]">Description</Label>
            <Input value={editData.description || ''} onChange={(e) => setEditData({ ...editData, description: e.target.value })} className="text-xs h-8" />
          </div>
          <div>
            <Label className="text-[10px]">Main URL</Label>
            <Input value={editData.url || ''} onChange={(e) => setEditData({ ...editData, url: e.target.value })} className="text-xs h-8" placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {friendSocialIcons.map(({ key, label }) => (
              <div key={key}>
                <Label className="text-[10px]">{label}</Label>
                <Input
                  value={editData.socials?.[key] || ''}
                  onChange={(e) => setEditData({ ...editData, socials: { ...editData.socials, [key]: e.target.value } })}
                  className="text-xs h-8"
                  placeholder="https://..."
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} className="flex-1">Save</Button>
          <Button size="sm" variant="outline" onClick={() => { setEditData(friend); setIsEditing(false) }}>Cancel</Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-card/50 border-border hover:border-primary/50 transition-all duration-300 overflow-hidden group hud-element hud-corner">
      <span className="corner-bl"></span>
      <span className="corner-br"></span>
      <div className="flex gap-3 p-4">
        {friend.photo ? (
          <div className="w-16 h-16 flex-shrink-0 overflow-hidden border border-border">
            <ProgressiveImage
              src={friend.photo}
              alt={friend.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 flex-shrink-0 bg-secondary/30 border border-border flex items-center justify-center">
            <User size={24} className="text-muted-foreground/40" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {friend.url ? (
                <a href={friend.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold hover:text-primary transition-colors line-clamp-1 flex items-center gap-1">
                  {friend.name}
                  <Link size={12} className="text-primary/40 flex-shrink-0" />
                </a>
              ) : (
                <p className="text-sm font-bold line-clamp-1">{friend.name}</p>
              )}
              {friend.description && (
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{friend.description}</p>
              )}
            </div>
            {editMode && (
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => { setEditData(friend); setIsEditing(true) }} className="p-1 text-muted-foreground hover:text-primary transition-colors">
                  <PencilSimple size={14} />
                </button>
                <button onClick={onDelete} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash size={14} />
                </button>
              </div>
            )}
          </div>
          {friend.socials && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {friendSocialIcons.map(({ key, icon: Icon, label }) => {
                const url = friend.socials?.[key]
                if (!url) return null
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground/60 hover:text-primary transition-colors"
                    title={label}
                  >
                    <Icon size={16} weight="fill" />
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default function BiographySection({ biography = defaultBiography, editMode, onUpdate, fontSizes, onFontSizeChange }: BiographySectionProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [photos, setPhotos] = useState<string[]>(biography.photos || [])
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [glitchActive, setGlitchActive] = useState(false)
  const [expandedMembers, setExpandedMembers] = useState<Set<number>>(new Set())
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

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="md:col-span-2 space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {photos.length > 0 && (
                <motion.div
                  className={`relative overflow-hidden rounded-lg aspect-square md:aspect-video group ${glitchActive ? 'glitch-effect' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <img
                    src={photos[currentPhotoIndex]}
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
                    <div className="space-y-3">
                      {biography.members.map((rawMember, index) => {
                        const member = normalizeMember(rawMember)
                        const isExpanded = expandedMembers.has(index)
                        const toggleExpanded = () => {
                          setExpandedMembers(prev => {
                            const next = new Set(prev)
                            if (next.has(index)) next.delete(index)
                            else next.add(index)
                            return next
                          })
                        }
                        return (
                          <div key={index} className="border border-border/50 rounded-lg p-3 hover:border-primary/30 transition-colors duration-200">
                            <div className="flex items-center gap-3">
                              {member.photo ? (
                                <div className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ${glitchActive ? 'glitch-effect' : ''} red-tint`}>
                                  <img
                                    src={member.photo}
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
                              {member.bio && (
                                <button
                                  onClick={toggleExpanded}
                                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                                  aria-label={isExpanded ? 'Collapse bio' : 'Expand bio'}
                                >
                                  <motion.span
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="block"
                                  >
                                    <CaretDown size={16} />
                                  </motion.span>
                                </button>
                              )}
                            </div>
                            <AnimatePresence>
                              {isExpanded && member.bio && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <p className="text-sm text-foreground/70 mt-2 pl-[52px]">
                                    {member.bio}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
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
          </div>

          {/* Friends / Partners Section */}
          {((biography.friends && biography.friends.length > 0) || editMode) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="mt-12"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg md:text-xl font-mono uppercase tracking-wider text-muted-foreground">
                  <span className="text-primary/40">&gt;</span> Friends &amp; Partners
                </h3>
                {editMode && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary/30 hover:bg-primary/10 gap-1"
                    onClick={() => {
                      const newFriend: Friend = {
                        id: `friend-${Date.now()}`,
                        name: 'New Friend',
                      }
                      handleUpdate({
                        ...biography,
                        friends: [...(biography.friends || []), newFriend]
                      })
                    }}
                  >
                    <Plus size={16} />
                    <span className="hidden md:inline">Add</span>
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(biography.friends || []).map((friend) => (
                  <FriendCard
                    key={friend.id}
                    friend={friend}
                    editMode={editMode}
                    onUpdate={(updated) => {
                      handleUpdate({
                        ...biography,
                        friends: (biography.friends || []).map(f => f.id === updated.id ? updated : f)
                      })
                    }}
                    onDelete={() => {
                      handleUpdate({
                        ...biography,
                        friends: (biography.friends || []).filter(f => f.id !== friend.id)
                      })
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
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
