import { motion, useInView } from 'framer-motion'
import { MusicNote, Plus, Trash, SpotifyLogo, SoundcloudLogo, YoutubeLogo, ArrowsClockwise } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ChromaticText } from '@/components/ChromaticText'
import type { Release } from '@/lib/types'
import { useState, useEffect, useRef } from 'react'
import ReleaseEditDialog from './ReleaseEditDialog'
import { format } from 'date-fns'
import { fetchITunesReleases } from '@/lib/itunes'
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
    (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
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
              ...(existing.streamingLinks || {}),
              appleMusic: iTunesMatch.streamingLinks?.appleMusic,
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
            className={`text-4xl md:text-5xl lg:text-6xl font-bold font-mono ${glitchActive ? 'glitch-text-effect' : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.6 }}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <div className="relative w-full h-full red-tint">
                        <img
                          src={release.artwork}
                          alt={release.title}
                          className="w-full h-full object-cover group-hover:scale-105 group-active:scale-110 transition-transform duration-500 select-none"
                          draggable={false}
                          style={{ filter: 'contrast(1.15) brightness(0.85)' }}
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
                        {format(new Date(release.releaseDate), 'MMMM yyyy')}
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
