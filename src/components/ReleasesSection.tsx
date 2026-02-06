import { motion } from 'framer-motion'
import { MusicNote, Plus, Trash, SpotifyLogo, SoundcloudLogo, YoutubeLogo } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Release } from '@/lib/types'
import { useState } from 'react'
import ReleaseEditDialog from './ReleaseEditDialog'
import { format } from 'date-fns'

interface ReleasesSectionProps {
  releases: Release[]
  editMode: boolean
  onUpdate: (releases: Release[]) => void
}

export default function ReleasesSection({ releases, editMode, onUpdate }: ReleasesSectionProps) {
  const [editingRelease, setEditingRelease] = useState<Release | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const sortedReleases = [...releases].sort(
    (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  )

  const handleDelete = (id: string) => {
    onUpdate(releases.filter(r => r.id !== id))
  }

  const handleSave = (release: Release) => {
    if (editingRelease) {
      onUpdate(releases.map(r => r.id === release.id ? release : r))
    } else {
      onUpdate([...releases, release])
    }
    setEditingRelease(null)
    setIsAdding(false)
  }

  return (
    <section className="py-20 px-4 bg-secondary/20" id="releases">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl md:text-5xl font-bold">RELEASES</h2>
          {editMode && (
            <Button
              onClick={() => setIsAdding(true)}
              className="bg-primary hover:bg-accent"
            >
              <Plus className="mr-2" size={20} />
              Add Release
            </Button>
          )}
        </div>

        <Separator className="bg-primary mb-12" />

        {sortedReleases.length === 0 ? (
          <div className="text-center py-16">
            <MusicNote size={64} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground text-lg">No releases yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedReleases.map((release, index) => (
              <motion.div
                key={release.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden bg-card border-border hover:border-primary transition-all duration-300 group">
                  <div className="aspect-square bg-secondary/50 flex items-center justify-center relative overflow-hidden">
                    {release.artwork ? (
                      <img
                        src={release.artwork}
                        alt={release.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MusicNote size={64} className="text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">{release.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {format(new Date(release.releaseDate), 'MMMM yyyy')}
                    </p>

                    {!editMode && (
                      <div className="flex gap-2 flex-wrap">
                        {release.streamingLinks.spotify && (
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="flex-1"
                          >
                            <a href={release.streamingLinks.spotify} target="_blank" rel="noopener noreferrer">
                              <SpotifyLogo size={18} />
                            </a>
                          </Button>
                        )}
                        {release.streamingLinks.soundcloud && (
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="flex-1"
                          >
                            <a href={release.streamingLinks.soundcloud} target="_blank" rel="noopener noreferrer">
                              <SoundcloudLogo size={18} />
                            </a>
                          </Button>
                        )}
                        {release.streamingLinks.youtube && (
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="flex-1"
                          >
                            <a href={release.streamingLinks.youtube} target="_blank" rel="noopener noreferrer">
                              <YoutubeLogo size={18} />
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
                          className="flex-1"
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
