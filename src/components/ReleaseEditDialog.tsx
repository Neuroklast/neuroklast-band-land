import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { Release } from '@/lib/types'

interface ReleaseEditDialogProps {
  release: Release | null
  onSave: (release: Release) => void
  onClose: () => void
}

export default function ReleaseEditDialog({ release, onSave, onClose }: ReleaseEditDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    artwork: '',
    releaseDate: '',
    spotify: '',
    soundcloud: '',
    bandcamp: '',
    youtube: '',
    appleMusic: ''
  })

  useEffect(() => {
    if (release) {
      const links = release.streamingLinks || {}
      setFormData({
        title: release.title,
        artwork: release.artwork || '',
        releaseDate: release.releaseDate,
        spotify: links.spotify || '',
        soundcloud: links.soundcloud || '',
        bandcamp: links.bandcamp || '',
        youtube: links.youtube || '',
        appleMusic: links.appleMusic || ''
      })
    }
  }, [release])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: release?.id || Date.now().toString(),
      title: formData.title,
      artwork: formData.artwork || undefined,
      releaseDate: formData.releaseDate,
      streamingLinks: {
        spotify: formData.spotify || undefined,
        soundcloud: formData.soundcloud || undefined,
        bandcamp: formData.bandcamp || undefined,
        youtube: formData.youtube || undefined,
        appleMusic: formData.appleMusic || undefined
      }
    })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{release ? 'Edit Release' : 'Add New Release'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-secondary border-input"
              placeholder="Track/Album Name"
            />
          </div>

          <div>
            <Label htmlFor="releaseDate">Release Date</Label>
            <Input
              id="releaseDate"
              type="date"
              value={formData.releaseDate}
              onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
              required
              className="bg-secondary border-input"
            />
          </div>

          <div>
            <Label htmlFor="artwork">Artwork URL (optional)</Label>
            <Input
              id="artwork"
              type="url"
              value={formData.artwork}
              onChange={(e) => setFormData({ ...formData, artwork: e.target.value })}
              className="bg-secondary border-input"
              placeholder="https://..."
            />
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="font-semibold mb-3">Streaming Links (optional)</h4>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="spotify">Spotify</Label>
                <Input
                  id="spotify"
                  type="url"
                  value={formData.spotify}
                  onChange={(e) => setFormData({ ...formData, spotify: e.target.value })}
                  className="bg-secondary border-input"
                  placeholder="https://open.spotify.com/..."
                />
              </div>

              <div>
                <Label htmlFor="soundcloud">SoundCloud</Label>
                <Input
                  id="soundcloud"
                  type="url"
                  value={formData.soundcloud}
                  onChange={(e) => setFormData({ ...formData, soundcloud: e.target.value })}
                  className="bg-secondary border-input"
                  placeholder="https://soundcloud.com/..."
                />
              </div>

              <div>
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  type="url"
                  value={formData.youtube}
                  onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                  className="bg-secondary border-input"
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div>
                <Label htmlFor="bandcamp">Bandcamp</Label>
                <Input
                  id="bandcamp"
                  type="url"
                  value={formData.bandcamp}
                  onChange={(e) => setFormData({ ...formData, bandcamp: e.target.value })}
                  className="bg-secondary border-input"
                  placeholder="https://bandcamp.com/..."
                />
              </div>

              <div>
                <Label htmlFor="appleMusic">Apple Music</Label>
                <Input
                  id="appleMusic"
                  type="url"
                  value={formData.appleMusic}
                  onChange={(e) => setFormData({ ...formData, appleMusic: e.target.value })}
                  className="bg-secondary border-input"
                  placeholder="https://music.apple.com/..."
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-primary hover:bg-accent">
              Save
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
