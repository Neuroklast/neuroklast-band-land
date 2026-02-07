import { motion, useInView, AnimatePresence } from 'framer-motion'
import { MusicNote, Plus, Trash, SpotifyLogo, SoundcloudLogo, YoutubeLogo, ArrowsClockwise, X } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ChromaticText } from '@/components/ChromaticText'
import ProgressiveImage from '@/components/ProgressiveImage'
import type { Release } from '@/lib/types'
import { useState, useEffect, useRef } from 'react'
import ReleaseEditDialog from './ReleaseEditDialog'
import { format } from 'date-fns'
import { fetchITunesReleases } from '@/lib/itunes'
import { fetchOdesliLinks } from '@/lib/odesli'
import { toast } from 'sonner'
import { useTypingEffect } from '@/hooks/use-typing-effect'

interface ReleasesSectionProps {
  releases: Release[]
  editMode: boolean
  onUpdate: (releases: Release[]) => void
}

export default function ReleasesSection({ releases, editMode, onUpdate }: ReleasesSectionProps) {
  const [editingRelease, setEditingRelease] = useState<Release | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false)
  const [glitchActive, setGlitchActive] = useState(false)
  const [expandedReleaseId, setExpandedReleaseId] = useState<string | null>(null)
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true })

  const titleText = 'RELEASES'
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
    if (!hasAutoLoaded && (!releases || releases.length === 0)) {
      setHasAutoLoaded(true)
      handleFetchITunesReleases(true)
    }
  }, [hasAutoLoaded, releases])

  const sortedReleases = [...(releases || [])].sort(
    (a, b) => {
      if (!a.releaseDate && !b.releaseDate) return 0
      if (!a.releaseDate) return 1
      if (!b.releaseDate) return -1
      return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    }
  )

  const handleDelete = (id: string) => {
    onUpdate((releases || []).filter(r => r.id !== id))
  }

  const handleSave = (release: Release) => {
    const currentReleases = releases || []
    if (editingRelease) {
      onUpdate(currentReleases.map(r => r.id === release.id ? release : r))
    } else {
      onUpdate([...currentReleases, release])
    }
    setEditingRelease(null)
    setIsAdding(false)
  }

  const handleFetchITunesReleases = async (isAutoLoad = false) => {
    setIsFetching(true)
    try {
      const iTunesReleases = await fetchITunesReleases()
      
      if (iTunesReleases.length === 0) {
        if (!isAutoLoad) {
          toast.error('No releases found on iTunes')
        }
        return
      }

      // Enrich iTunes releases with Odesli streaming links in batches of 5
      const BATCH_SIZE = 5
      for (let i = 0; i < iTunesReleases.length; i += BATCH_SIZE) {
        const batch = iTunesReleases.slice(i, i + BATCH_SIZE)
        await Promise.allSettled(
          batch.map(async (release) => {
            const appleMusicUrl = release.streamingLinks?.appleMusic
            if (!appleMusicUrl) return
            try {
              const odesliLinks = await fetchOdesliLinks(appleMusicUrl)
              if (odesliLinks) {
                release.streamingLinks = {
                  ...release.streamingLinks,
                  spotify: release.streamingLinks.spotify || odesliLinks.spotify,
                  soundcloud: release.streamingLinks.soundcloud || odesliLinks.soundcloud,
                  youtube: release.streamingLinks.youtube || odesliLinks.youtube,
                  bandcamp: release.streamingLinks.bandcamp || odesliLinks.bandcamp,
                }
              }
            } catch (e) {
              console.error(`Odesli enrichment failed for ${release.title}:`, e)
            }
          })
        )
      }

      const currentReleases = releases || []
      const existingIds = new Set(currentReleases.map(r => r.id))
      const newReleases = iTunesReleases.filter(r => !existingIds.has(r.id))
      
      const updatedReleases = currentReleases.map(existing => {
        const iTunesMatch = iTunesReleases.find(s => s.id === existing.id)
        if (iTunesMatch) {
          return {
            ...existing,
            artwork: iTunesMatch.artwork || existing.artwork,
            streamingLinks: {
              // Odesli/iTunes links first, then existing links override (preserving user edits)
              ...Object.fromEntries(
                Object.entries(iTunesMatch.streamingLinks || {}).filter(([, v]) => v)
              ),
              ...Object.fromEntries(
                Object.entries(existing.streamingLinks || {}).filter(([, v]) => v)
              ),
            }
          }
        }
        return existing
      })

      const mergedReleases = [...updatedReleases, ...newReleases]
      onUpdate(mergedReleases)
      
      if (!isAutoLoad) {
        toast.success(`Imported ${newReleases.length} new releases from iTunes`)
      }
    } catch (error) {
      if (!isAutoLoad) {
        toast.error('Failed to fetch releases from iTunes')
      }
      console.error(error)
    } finally {
      setIsFetching(false)
    }
  }

  return (
    <section ref={sectionRef} className="py-24 px-4 bg-gradient-to-b from-secondary/5 via-background to-background" id="releases">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-4">
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
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => handleFetchITunesReleases(false)}
                disabled={isFetching}
                variant="outline"
                className="border-primary/30 hover:bg-primary/10 active:scale-95 transition-transform touch-manipulation"
              >
                <ArrowsClockwise className={`${isFetching ? 'animate-spin mr-2' : 'mr-0 md:mr-2'}`} size={20} />
                <span className="hidden md:inline">{isFetching ? 'Fetching...' : 'Sync iTunes'}</span>
              </Button>
              <Button
                onClick={() => setIsAdding(true)}
                className="bg-primary hover:bg-accent active:scale-95 transition-transform touch-manipulation"
              >
                <Plus className="mr-0 md:mr-2" size={20} />
                <span className="hidden md:inline">Add Release</span>
              </Button>
            </div>
          )}
        </div>

        <Separator className="bg-gradient-to-r from-primary via-primary/50 to-transparent mb-12 h-0.5" />

        {sortedReleases.length === 0 ? (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <MusicNote size={64} className="mx-auto mb-6 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-lg">No releases yet.</p>
          </motion.div>
        ) : (
          <>
            {/* Mobile: horizontal scroller */}
            <div className="md:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
                {sortedReleases.map((release, index) => {
                  const isExpanded = expandedReleaseId === release.id
                  return (
                    <motion.div
                      key={release.id}
                      className="w-[160px] flex-shrink-0"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <div
                        className="relative cursor-pointer touch-manipulation"
                        onClick={() => setExpandedReleaseId(isExpanded ? null : release.id)}
                      >
                        <div className="aspect-square bg-secondary/30 relative overflow-hidden border border-border hover:border-primary/50 transition-colors">
                          {release.artwork ? (
                            <div className="relative w-full h-full">
                              <ProgressiveImage
                                src={release.artwork}
                                alt={release.title}
                                className="w-full h-full object-cover select-none"
                                draggable={false}
                                style={{ filter: 'contrast(1.15) brightness(0.85)' }}
                              />
                              <div className="absolute inset-0 pointer-events-none"
                                style={{
                                  backgroundImage: `radial-gradient(circle, oklch(0 0 0 / 0.4) 1px, transparent 1px)`,
                                  backgroundSize: '3px 3px'
                                }}
                              />
                              <div className="absolute inset-0 pointer-events-none"
                                style={{
                                  backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, oklch(0 0 0 / 0.08) 2px, oklch(0 0 0 / 0.08) 3px)`
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <MusicNote size={48} className="text-muted-foreground opacity-30" />
                            </div>
                          )}
                        </div>
                        <div className="mt-2">
                          <h3 className="text-sm font-bold line-clamp-2 leading-tight">{release.title}</h3>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {release.releaseDate
                              ? format(new Date(release.releaseDate), 'MMM yyyy')
                              : '—'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Mobile: expanded release links overlay */}
            <AnimatePresence>
              {expandedReleaseId && (() => {
                const release = sortedReleases.find(r => r.id === expandedReleaseId)
                if (!release) return null
                return (
                  <motion.div
                    key="mobile-links"
                    className="md:hidden fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setExpandedReleaseId(null)}
                  >
                    <motion.div
                      className="w-full max-w-sm"
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="absolute top-4 right-4 p-2 text-primary/60 hover:text-primary"
                        onClick={() => setExpandedReleaseId(null)}
                      >
                        <X size={24} />
                      </button>
                      <div className="flex flex-col items-center gap-4">
                        {release.artwork && (
                          <div className="w-48 h-48 relative overflow-hidden border border-primary/30">
                            <img
                              src={release.artwork}
                              alt={release.title}
                              className="w-full h-full object-cover"
                              style={{ filter: 'contrast(1.15) brightness(0.85)' }}
                            />
                          </div>
                        )}
                        <div className="text-center">
                          <h3 className="text-lg font-bold">{release.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {release.releaseDate
                              ? format(new Date(release.releaseDate), 'MMMM yyyy')
                              : 'Release date unknown'}
                          </p>
                        </div>
                        {release.streamingLinks && (
                          <div className="grid grid-cols-2 gap-2 w-full">
                            {release.streamingLinks.spotify && (
                              <Button size="sm" variant="outline" asChild className="border-primary/30 hover:bg-primary/10">
                                <a href={release.streamingLinks.spotify} target="_blank" rel="noopener noreferrer">
                                  <SpotifyLogo size={18} weight="fill" className="mr-1" />
                                  <span className="text-xs">Spotify</span>
                                </a>
                              </Button>
                            )}
                            {release.streamingLinks.soundcloud && (
                              <Button size="sm" variant="outline" asChild className="border-primary/30 hover:bg-primary/10">
                                <a href={release.streamingLinks.soundcloud} target="_blank" rel="noopener noreferrer">
                                  <SoundcloudLogo size={18} weight="fill" className="mr-1" />
                                  <span className="text-xs">SoundCloud</span>
                                </a>
                              </Button>
                            )}
                            {release.streamingLinks.youtube && (
                              <Button size="sm" variant="outline" asChild className="border-primary/30 hover:bg-primary/10">
                                <a href={release.streamingLinks.youtube} target="_blank" rel="noopener noreferrer">
                                  <YoutubeLogo size={18} weight="fill" className="mr-1" />
                                  <span className="text-xs">YouTube</span>
                                </a>
                              </Button>
                            )}
                            {release.streamingLinks.bandcamp && (
                              <Button size="sm" variant="outline" asChild className="border-primary/30 hover:bg-primary/10">
                                <a href={release.streamingLinks.bandcamp} target="_blank" rel="noopener noreferrer">
                                  <MusicNote size={18} weight="fill" className="mr-1" />
                                  <span className="text-xs">Bandcamp</span>
                                </a>
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                )
              })()}
            </AnimatePresence>

            {/* Desktop: grid layout */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedReleases.map((release, index) => (
                <motion.div
                  key={release.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 active:border-primary transition-all duration-300 group active:scale-[0.97] touch-manipulation hud-element hud-corner hud-scanline">
                    <span className="corner-bl"></span>
                    <span className="corner-br"></span>
                    
                    <div className="aspect-square bg-secondary/30 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute top-2 left-2 z-10 data-readout text-[8px]">
                        REL_{String(index).padStart(2, '0')}
                      </div>
                      <div className="absolute top-2 right-2 z-10">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ boxShadow: '0 0 6px oklch(0.50 0.22 25)' }}></div>
                      </div>
                      
                      {release.artwork ? (
                        <div className="relative w-full h-full">
                          <ProgressiveImage
                            src={release.artwork}
                            alt={release.title}
                            className="w-full h-full object-cover group-hover:scale-105 group-active:scale-110 transition-transform duration-500 select-none"
                            draggable={false}
                            style={{ filter: 'contrast(1.15) brightness(0.85)' }}
                          />
                          <div className="absolute inset-0 pointer-events-none z-[1]"
                            style={{
                              backgroundImage: `radial-gradient(circle, oklch(0 0 0 / 0.4) 1px, transparent 1px)`,
                              backgroundSize: '3px 3px'
                            }}
                          />
                          <div className="absolute inset-0 pointer-events-none z-[2]"
                            style={{
                              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, oklch(0 0 0 / 0.08) 2px, oklch(0 0 0 / 0.08) 3px)`
                            }}
                          />
                        </div>
                      ) : (
                        <MusicNote size={72} className="text-muted-foreground opacity-30" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300" />
                      <div className="absolute inset-0 bg-primary/0 group-active:bg-primary/10 transition-colors duration-100 pointer-events-none" />
                    </div>
                    
                    <div className="p-4 md:p-5 space-y-3 md:space-y-4">
                      <div>
                        <h3 className="text-lg md:text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">{release.title}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {release.releaseDate
                            ? format(new Date(release.releaseDate), 'MMMM yyyy')
                            : 'Release date unknown'}
                        </p>
                      </div>

                      {!editMode && release.streamingLinks && (
                        <div className="grid grid-cols-2 gap-2">
                          {release.streamingLinks.spotify && (
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="border-primary/30 hover:bg-primary/10 hover:border-primary active:scale-95 transition-all touch-manipulation"
                            >
                              <a href={release.streamingLinks.spotify} target="_blank" rel="noopener noreferrer">
                                <SpotifyLogo size={18} weight="fill" className="mr-1" />
                                <span className="text-xs">Spotify</span>
                              </a>
                            </Button>
                          )}
                          {release.streamingLinks.soundcloud && (
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="border-primary/30 hover:bg-primary/10 hover:border-primary active:scale-95 transition-all touch-manipulation"
                            >
                              <a href={release.streamingLinks.soundcloud} target="_blank" rel="noopener noreferrer">
                                <SoundcloudLogo size={18} weight="fill" className="mr-1" />
                                <span className="text-xs">SoundCloud</span>
                              </a>
                            </Button>
                          )}
                          {release.streamingLinks.youtube && (
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="border-primary/30 hover:bg-primary/10 hover:border-primary active:scale-95 transition-all touch-manipulation"
                            >
                              <a href={release.streamingLinks.youtube} target="_blank" rel="noopener noreferrer">
                                <YoutubeLogo size={18} weight="fill" className="mr-1" />
                                <span className="text-xs">YouTube</span>
                              </a>
                            </Button>
                          )}
                          {release.streamingLinks.bandcamp && (
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="border-primary/30 hover:bg-primary/10 hover:border-primary active:scale-95 transition-all touch-manipulation"
                            >
                              <a href={release.streamingLinks.bandcamp} target="_blank" rel="noopener noreferrer">
                                <MusicNote size={18} weight="fill" className="mr-1" />
                                <span className="text-xs">Bandcamp</span>
                              </a>
                            </Button>
                          )}
                        </div>
                      )}

                      {editMode && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingRelease(release)}
                            className="flex-1 border-primary/30 hover:bg-primary/10 active:scale-95 transition-transform touch-manipulation"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(release.id)}
                            className="active:scale-95 transition-transform touch-manipulation"
                          >
                            <Trash size={18} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Mobile edit mode: stack normally */}
            {editMode && (
              <div className="md:hidden grid grid-cols-1 gap-4">
                {sortedReleases.map((release) => (
                  <Card key={release.id} className="p-4 bg-card/50 border-border flex items-center gap-4">
                    {release.artwork && (
                      <img src={release.artwork} alt={release.title} className="w-16 h-16 object-cover flex-shrink-0 border border-border" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold line-clamp-1">{release.title}</h3>
                      <p className="text-[10px] text-muted-foreground">
                        {release.releaseDate ? format(new Date(release.releaseDate), 'MMM yyyy') : '—'}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => setEditingRelease(release)} className="border-primary/30">
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(release.id)}>
                        <Trash size={16} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {(editingRelease || isAdding) && (
        <ReleaseEditDialog
          release={editingRelease}
          onSave={handleSave}
          onClose={() => {
            setEditingRelease(null)
            setIsAdding(false)
          }}
        />
      )}
    </section>
  )
}
