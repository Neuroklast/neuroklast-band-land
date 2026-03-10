import { useState, useEffect, useRef, useCallback, startTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, X, UploadSimple, CheckCircle, WarningCircle, SpinnerGap } from '@phosphor-icons/react'
import type { Gig } from '@/lib/types'
import { toast } from 'sonner'
import { toDirectImageUrl } from '@/lib/image-cache'
import { useLocale } from '@/hooks/use-locale'

type LocationStatus = 'idle' | 'validating' | 'valid' | 'invalid'

const LOCATION_VALIDATION_DEBOUNCE_MS = 800
const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search'

interface GigEditDialogProps {
  open: boolean
  gig: Gig | null
  onSave: (gig: Gig) => void
  onClose: () => void
}

export default function GigEditDialog({ gig, onSave, onClose }: GigEditDialogProps) {
  const { t } = useLocale()
  const [formData, setFormData] = useState({
    date: '',
    venue: '',
    location: '',
    ticketUrl: '',
    gigType: '' as '' | 'concert' | 'dj',
    allDay: false,
    status: '' as '' | 'confirmed' | 'cancelled' | 'soldout' | 'announced',
    eventLinks: {
      facebook: '',
      instagram: '',
      residentAdvisor: '',
      other: ''
    },
    photo: ''
  })
  const [supportingArtists, setSupportingArtists] = useState<string[]>([])
  const [newArtist, setNewArtist] = useState('')
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle')
  const locationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const validateLocation = useCallback((location: string) => {
    if (locationTimerRef.current) clearTimeout(locationTimerRef.current)
    if (!location.trim()) {
      setLocationStatus('idle')
      return
    }
    setLocationStatus('validating')
    locationTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${NOMINATIM_SEARCH_URL}?format=json&limit=1&q=${encodeURIComponent(location)}`,
          { headers: { 'Accept': 'application/json' } }
        )
        if (!res.ok) { setLocationStatus('idle'); return }
        const data = await res.json()
        setLocationStatus(Array.isArray(data) && data.length > 0 ? 'valid' : 'invalid')
      } catch {
        setLocationStatus('idle')
      }
    }, LOCATION_VALIDATION_DEBOUNCE_MS)
  }, [])

  useEffect(() => {
    return () => { if (locationTimerRef.current) clearTimeout(locationTimerRef.current) }
  }, [])

  useEffect(() => {
    if (gig) {
      startTransition(() => {
        setFormData({
          date: gig.date,
          venue: gig.venue,
          location: gig.location,
          ticketUrl: gig.ticketUrl || '',
          gigType: gig.gigType || '',
          allDay: gig.allDay || false,
          status: gig.status || '',
          eventLinks: {
            facebook: gig.eventLinks?.facebook || '',
            instagram: gig.eventLinks?.instagram || '',
            residentAdvisor: gig.eventLinks?.residentAdvisor || '',
            other: gig.eventLinks?.other || ''
          },
          photo: gig.photo || ''
        })
        setSupportingArtists(gig.supportingArtists || [])
      })
    }
  }, [gig])

  const addArtist = () => {
    const trimmed = newArtist.trim()
    if (trimmed) {
      setSupportingArtists([...supportingArtists, trimmed])
      setNewArtist('')
    }
  }

  const removeArtist = (index: number) => {
    setSupportingArtists(supportingArtists.filter((_, i) => i !== index))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setFormData(prev => ({ ...prev, photo: dataUrl }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const eventLinks = Object.fromEntries(
      Object.entries(formData.eventLinks).filter(([, v]) => v)
    )
    onSave({
      id: gig?.id || Date.now().toString(),
      date: formData.date,
      venue: formData.venue,
      location: formData.location,
      ...(formData.ticketUrl && { ticketUrl: formData.ticketUrl }),
      ...(formData.gigType && { gigType: formData.gigType }),
      ...(formData.allDay && { allDay: true }),
      ...(formData.status && { status: formData.status }),
      ...(Object.keys(eventLinks).length > 0 && { eventLinks }),
      ...(supportingArtists.length > 0 && { supportingArtists }),
      ...(formData.photo && { photo: toDirectImageUrl(formData.photo) })
    })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{gig ? t('gigEdit.editTitle') : t('gigEdit.addTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="date">{formData.allDay ? t('common.date') : t('gigEdit.dateTime')}</Label>
              <Input
                id="date"
                type={formData.allDay ? 'date' : 'datetime-local'}
                value={formData.allDay ? formData.date.split('T')[0] : formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="bg-secondary border-input"
              />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <input
                id="allDay"
                type="checkbox"
                checked={formData.allDay}
                onChange={(e) => {
                  const checked = e.target.checked
                  const date = checked
                    ? formData.date.split('T')[0]
                    : formData.date.includes('T') ? formData.date : `${formData.date}T00:00`
                  setFormData({ ...formData, allDay: checked, date })
                }}
                className="h-4 w-4 accent-primary"
              />
              <Label htmlFor="allDay" className="text-sm whitespace-nowrap cursor-pointer">{t('gigEdit.allDay')}</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="gigType">{t('gigEdit.gigType')}</Label>
            <select
              id="gigType"
              value={formData.gigType}
              onChange={(e) => setFormData({ ...formData, gigType: e.target.value as '' | 'concert' | 'dj' })}
              className="flex h-10 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">{t('common.noneOption')}</option>
              <option value="concert">{t('gigEdit.concert')}</option>
              <option value="dj">{t('gigEdit.djSet')}</option>
            </select>
          </div>

          <div>
            <Label htmlFor="status">{t('gigEdit.statusOptional')}</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as '' | 'confirmed' | 'cancelled' | 'soldout' | 'announced' })}
              className="flex h-10 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">{t('common.noneOption')}</option>
              <option value="confirmed">{t('gigEdit.confirmed')}</option>
              <option value="announced">{t('gigEdit.announced')}</option>
              <option value="soldout">{t('gigEdit.soldOut')}</option>
              <option value="cancelled">{t('gigEdit.cancelled')}</option>
            </select>
          </div>

          <div>
            <Label htmlFor="venue">{t('gigEdit.venue')}</Label>
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
            <Label htmlFor="location">{t('gigEdit.location')}</Label>
            <div className="relative">
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => {
                  setFormData({ ...formData, location: e.target.value })
                  validateLocation(e.target.value)
                }}
                required
                className="bg-secondary border-input pr-8"
                placeholder="City, Country"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                {locationStatus === 'validating' && <SpinnerGap size={16} className="text-muted-foreground animate-spin" />}
                {locationStatus === 'valid' && <CheckCircle size={16} className="text-status-success-em" weight="fill" />}
                {locationStatus === 'invalid' && <WarningCircle size={16} className="text-status-warning-em" weight="fill" />}
              </div>
            </div>
            {locationStatus === 'invalid' && (
              <p className="text-[10px] text-status-warning-em mt-1 font-mono">{t('gigEdit.addressNotFound')}</p>
            )}
            {locationStatus === 'valid' && (
              <p className="text-[10px] text-status-success-em mt-1 font-mono">{t('gigEdit.addressVerified')}</p>
            )}
          </div>

          <div>
            <Label htmlFor="ticketUrl">{t('gigEdit.ticketUrlOptional')}</Label>
            <Input
              id="ticketUrl"
              type="url"
              value={formData.ticketUrl}
              onChange={(e) => setFormData({ ...formData, ticketUrl: e.target.value })}
              className="bg-secondary border-input"
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="photo">{t('gigEdit.photoOptional')}</Label>
            <div className="flex gap-2">
              <Input
                id="photo"
                type="url"
                value={formData.photo.startsWith('data:') ? '' : formData.photo}
                onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                className="bg-secondary border-input flex-1"
                placeholder="https://..."
              />
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => photoInputRef.current?.click()}
                className="border-primary/30 hover:bg-primary/10 flex-shrink-0"
                title="Upload image"
              >
                <UploadSimple size={18} />
              </Button>
            </div>
            {formData.photo && (
              <div className="mt-2 relative w-16 h-16 rounded overflow-hidden border border-border">
                <img src={formData.photo} alt="Photo preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <Label>{t('gigEdit.supportingArtists')}</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={newArtist}
                onChange={(e) => setNewArtist(e.target.value)}
                placeholder="Add artist name"
                className="bg-secondary border-input"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addArtist() } }}
              />
              <Button type="button" onClick={addArtist} size="icon" className="flex-shrink-0">
                <Plus size={16} />
              </Button>
            </div>
            {supportingArtists.map((artist, index) => (
              <div key={index} className="flex gap-2 items-center mt-2">
                <Input value={artist} disabled className="flex-1 bg-secondary border-input" />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeArtist(index)}>
                  <X size={16} />
                </Button>
              </div>
            ))}
          </div>

          <div>
            <Label className="mb-2 block">{t('gigEdit.eventLinksOptional')}</Label>
            <div className="space-y-2">
              <Input
                type="url"
                value={formData.eventLinks.facebook}
                onChange={(e) => setFormData({ ...formData, eventLinks: { ...formData.eventLinks, facebook: e.target.value } })}
                className="bg-secondary border-input"
                placeholder="Facebook Event URL"
              />
              <Input
                type="url"
                value={formData.eventLinks.instagram}
                onChange={(e) => setFormData({ ...formData, eventLinks: { ...formData.eventLinks, instagram: e.target.value } })}
                className="bg-secondary border-input"
                placeholder="Instagram Post URL"
              />
              <Input
                type="url"
                value={formData.eventLinks.residentAdvisor}
                onChange={(e) => setFormData({ ...formData, eventLinks: { ...formData.eventLinks, residentAdvisor: e.target.value } })}
                className="bg-secondary border-input"
                placeholder="Resident Advisor URL"
              />
              <Input
                type="url"
                value={formData.eventLinks.other}
                onChange={(e) => setFormData({ ...formData, eventLinks: { ...formData.eventLinks, other: e.target.value } })}
                className="bg-secondary border-input"
                placeholder="Other Event URL"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-primary hover:bg-accent">
              {t('common.save')}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
