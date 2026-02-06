import { motion } from 'framer-motion'
import { MusicNote, Plus, Trash, SpotifyLogo, SoundcloudLogo, YoutubeLogo, ArrowsClockwise } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Release } from '@/lib/types'
import { useState, useEffect } from 'react'
import ReleaseEditDialog from './ReleaseEditDialog'
import { format } from 'date-fns'
import { fetchSpotifyReleases } from '@/lib/spotify'
import { toast } from 'sonner'

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

  useEffect(() => {
    if (!hasAutoLoaded && (!releases || releases.length === 0)) {
      setHasAutoLoaded(true)
      handleFetchSpotifyReleases(true)
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

  const handleFetchSpotifyReleases = async (isAutoLoad = false) => {
    setIsFetching(true)
    try {
      const spotifyReleases = await fetchSpotifyReleases()
      
      if (spotifyReleases.length === 0) {
        if (!isAutoLoad) {
          toast.error('No releases found on Spotify')
        }
        return
      }

      const currentReleases = releases || []
      const existingIds = new Set(currentReleases.map(r => r.id))
      const newReleases = spotifyReleases.filter(r => !existingIds.has(r.id))
      
      const updatedReleases = currentReleases.map(existing => {
        const spotifyMatch = spotifyReleases.find(s => s.id === existing.id)
        if (spotifyMatch) {
          return {
            ...existing,
            artwork: spotifyMatch.artwork || existing.artwork,
            streamingLinks: {
              ...existing.streamingLinks,
              spotify: spotifyMatch.streamingLinks.spotify,
            }
          }
        }
        return existing
      })

      const mergedReleases = [...updatedReleases, ...newReleases]
      onUpdate(mergedReleases)
      
      if (!isAutoLoad) {
        toast.success(`Imported ${newReleases.length} new releases from Spotify`)
      }
    } catch (error) {
      if (!isAutoLoad) {
        toast.error('Failed to fetch releases from Spotify')
      }
      console.error(error)
    } finally {
      setIsFetching(false)
    }
  }

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-secondary/5 via-background to-background" id="releases">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12 flex-wrap gap-4">
          <motion.h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            RELEASES
          </motion.h2>
          {editMode && (
            <div className="flex gap-2">
              <Button
                onClick={() => handleFetchSpotifyReleases(false)}
                disabled={isFetching}
                variant="outline"
                className="border-primary/30 hover:bg-primary/10"
              >
                <ArrowsClockwise className={`mr-2 ${isFetching ? 'animate-spin' : ''}`} size={20} />
                {isFetching ? 'Fetching...' : 'Sync Spotify'}
              </Button>
              <Button
                onClick={() => setIsAdding(true)}
                className="bg-primary hover:bg-accent"
              >
                <Plus className="mr-2" size={20} />
                Add Release
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
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 group">
                  <div className="aspect-square bg-secondary/30 flex items-center justify-center relative overflow-hidden">
                    {release.artwork ? (
                      <img
                        src={release.artwork}
                        alt={release.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <MusicNote size={72} className="text-muted-foreground opacity-30" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">{release.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(release.releaseDate), 'MMMM yyyy')}
                      </p>
                    </div>

                    {!editMode && (
                      <div className="flex gap-2 flex-wrap">
                        {release.streamingLinks.spotify && (
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="flex-1 min-w-[80px] border-primary/30 hover:bg-primary/10 hover:border-primary"
                          >
                            <a href={release.streamingLinks.spotify} target="_blank" rel="noopener noreferrer">
                              <SpotifyLogo size={18} weight="fill" />
                            </a>
                          </Button>
                        )}
                        {release.streamingLinks.soundcloud && (
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="flex-1 min-w-[80px] border-primary/30 hover:bg-primary/10 hover:border-primary"
                          >
                            <a href={release.streamingLinks.soundcloud} target="_blank" rel="noopener noreferrer">
                              <SoundcloudLogo size={18} weight="fill" />
                            </a>
                          </Button>
                        )}
                        {release.streamingLinks.youtube && (
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="flex-1 min-w-[80px] border-primary/30 hover:bg-primary/10 hover:border-primary"
                          >
                            <a href={release.streamingLinks.youtube} target="_blank" rel="noopener noreferrer">
                              <YoutubeLogo size={18} weight="fill" />
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
                          className="flex-1 border-primary/30 hover:bg-primary/10"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(release.id)}
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
