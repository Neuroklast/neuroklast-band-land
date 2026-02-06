import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { Gig } from '@/lib/types'

interface GigEditDialogProps {
  gig: Gig | null
  onSave: (gig: Gig) => void
  onClose: () => void
}

export default function GigEditDialog({ gig, onSave, onClose }: GigEditDialogProps) {
  const [formData, setFormData] = useState({
    date: '',
    venue: '',
    location: '',
    ticketUrl: ''
  })

  useEffect(() => {
    if (gig) {
      setFormData({
        date: gig.date,
        venue: gig.venue,
        location: gig.location,
        ticketUrl: gig.ticketUrl || ''
      })
    }
  }, [gig])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: gig?.id || Date.now().toString(),
      ...formData
    })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>{gig ? 'Edit Gig' : 'Add New Gig'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Date & Time</Label>
            <Input
              id="date"
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="bg-secondary border-input"
            />
          </div>

          <div>
            <Label htmlFor="venue">Venue</Label>
            <Input
              id="venue"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              required
              className="bg-secondary border-input"
              placeholder="Club Name"
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              className="bg-secondary border-input"
              placeholder="City, Country"
            />
          </div>

          <div>
            <Label htmlFor="ticketUrl">Ticket URL (optional)</Label>
            <Input
              id="ticketUrl"
              type="url"
              value={formData.ticketUrl}
              onChange={(e) => setFormData({ ...formData, ticketUrl: e.target.value })}
              className="bg-secondary border-input"
              placeholder="https://..."
            />
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
