import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { Release } from '@/lib/types'
import { fetchOdesliLinks } from '@/lib/odesli'
import { toast } from 'sonner'

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
  const [isSaving, setIsSaving] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    let artwork = formData.artwork || undefined
    let spotify = formData.spotify || undefined
    let soundcloud = formData.soundcloud || undefined
    let bandcamp = formData.bandcamp || undefined
    let youtube = formData.youtube || undefined
    let appleMusic = formData.appleMusic || undefined

    // Use the first available streaming link to look up the rest via Odesli
    const lookupUrl = formData.spotify || formData.appleMusic || formData.soundcloud || formData.youtube || formData.bandcamp
    if (lookupUrl) {
      try {
        const odesliResult = await fetchOdesliLinks(lookupUrl)
        if (odesliResult) {
          // Only fill in missing values — never overwrite user entries
          spotify = spotify || odesliResult.spotify
          appleMusic = appleMusic || odesliResult.appleMusic
          soundcloud = soundcloud || odesliResult.soundcloud
          youtube = youtube || odesliResult.youtube
          bandcamp = bandcamp || odesliResult.bandcamp
          artwork = artwork || odesliResult.artwork
          toast.success('Streaming links enriched via Odesli')
        }
      } catch {
        // Odesli lookup failed — save with the data we have
        console.error('Odesli enrichment failed, saving without enrichment')
      }
    }

    onSave({
      id: release?.id || Date.now().toString(),
      title: formData.title,
      artwork,
      releaseDate: formData.releaseDate,
      streamingLinks: { spotify, soundcloud, bandcamp, youtube, appleMusic }
    })
    setIsSaving(false)
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
            <Button type="submit" disabled={isSaving} className="flex-1 bg-primary hover:bg-accent">
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
