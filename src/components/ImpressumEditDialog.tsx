import { useState, useEffect, startTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Impressum } from '@/lib/types'
import { useLocale } from '@/contexts/LocaleContext'

interface ImpressumEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  impressum?: Impressum
  onSave: (impressum: Impressum) => void
}

const emptyImpressum: Impressum = {
  name: '',
  careOf: '',
  street: '',
  zipCity: '',
  phone: '',
  email: '',
  responsibleName: '',
  responsibleAddress: '',
}

export default function ImpressumEditDialog({ open, onOpenChange, impressum, onSave }: ImpressumEditDialogProps) {
  const [form, setForm] = useState<Impressum>(impressum || emptyImpressum)
  const { t } = useLocale()

  useEffect(() => {
    startTransition(() => {
      setForm(impressum || emptyImpressum)
    })
  }, [impressum])

  const update = (field: keyof Impressum, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    onSave({
      name: form.name,
      careOf: form.careOf || undefined,
      street: form.street || undefined,
      zipCity: form.zipCity || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      responsibleName: form.responsibleName || undefined,
      responsibleAddress: form.responsibleAddress || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('impressum.editTitle')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            {t('impressum.legalRef')}
          </p>

          <div className="space-y-2">
            <Label htmlFor="imp-name">{t('impressum.nameLabel')}</Label>
            <Input
              id="imp-name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder={t('impressum.namePlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imp-careof">{t('impressum.careOfLabel')}</Label>
            <Input
              id="imp-careof"
              value={form.careOf || ''}
              onChange={(e) => update('careOf', e.target.value)}
              placeholder={t('impressum.careOfPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imp-street">{t('impressum.streetLabel')}</Label>
            <Input
              id="imp-street"
              value={form.street || ''}
              onChange={(e) => update('street', e.target.value)}
              placeholder={t('impressum.streetPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imp-zipcity">{t('impressum.zipCityLabel')}</Label>
            <Input
              id="imp-zipcity"
              value={form.zipCity || ''}
              onChange={(e) => update('zipCity', e.target.value)}
              placeholder={t('impressum.zipCityPlaceholder')}
            />
          </div>

          <div className="border-t border-border pt-4 mt-4">
            <p className="text-sm text-muted-foreground mb-4">{t('impressum.contactLabel')}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imp-phone">{t('impressum.phoneLabel')}</Label>
            <Input
              id="imp-phone"
              value={form.phone || ''}
              onChange={(e) => update('phone', e.target.value)}
              placeholder={t('impressum.phonePlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imp-email">{t('impressum.emailLabel')}</Label>
            <Input
              id="imp-email"
              value={form.email || ''}
              onChange={(e) => update('email', e.target.value)}
              placeholder={t('impressum.emailPlaceholder')}
            />
          </div>

          <div className="border-t border-border pt-4 mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              {t('impressum.responsibleLabel')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imp-resp-name">{t('impressum.responsibleNameLabel')}</Label>
            <Input
              id="imp-resp-name"
              value={form.responsibleName || ''}
              onChange={(e) => update('responsibleName', e.target.value)}
              placeholder={t('impressum.responsibleNamePlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imp-resp-addr">{t('impressum.responsibleAddressLabel')}</Label>
            <Input
              id="imp-resp-addr"
              value={form.responsibleAddress || ''}
              onChange={(e) => update('responsibleAddress', e.target.value)}
              placeholder={t('impressum.responsibleAddressPlaceholder')}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('impressum.cancel')}</Button>
          <Button onClick={handleSave} disabled={!form.name.trim()}>{t('impressum.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
