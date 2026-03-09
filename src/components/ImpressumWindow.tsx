import { useState, useEffect, startTransition } from 'react'
import { motion } from 'framer-motion'
import CyberModalBackdrop from '@/components/CyberModalBackdrop'
import { PencilSimple } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CyberCloseButton from '@/components/CyberCloseButton'
import ProtectedText from '@/components/ProtectedText'
import type { Impressum } from '@/lib/types'
import { useLocale } from '@/contexts/LocaleContext'
import { t as i18nT } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

interface ImpressumWindowProps {
  isOpen: boolean
  onClose: () => void
  impressum?: Impressum
  editMode?: boolean
  onEdit?: () => void
  onSave?: (impressum: Impressum) => void
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

export default function ImpressumWindow({ isOpen, onClose, impressum, editMode, onSave }: ImpressumWindowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<Impressum>(impressum || emptyImpressum)
  const { locale, t: translate } = useLocale()
  const [lang, setLang] = useState<'de' | 'en'>(locale)
  const [editLang, setEditLang] = useState<'de' | 'en'>(locale)

  // Helper to translate using the local language toggle
  const tl = (key: string, l: Locale = lang) => i18nT(key, l)

  useEffect(() => {
    if (isOpen) {
      startTransition(() => {
        setForm(impressum || emptyImpressum)
        setIsEditing(false)
      })
    }
  }, [isOpen, impressum])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const update = (field: keyof Impressum, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    onSave?.({
      name: form.name,
      careOf: form.careOf || undefined,
      street: form.street || undefined,
      zipCity: form.zipCity || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      responsibleName: form.responsibleName || undefined,
      responsibleAddress: form.responsibleAddress || undefined,
      nameEn: form.nameEn || undefined,
      careOfEn: form.careOfEn || undefined,
      streetEn: form.streetEn || undefined,
      zipCityEn: form.zipCityEn || undefined,
      responsibleNameEn: form.responsibleNameEn || undefined,
      responsibleAddressEn: form.responsibleAddressEn || undefined,
    })
    setIsEditing(false)
  }

  const t = {
    title: tl('impressum.title'),
    titleEdit: tl('impressum.titleEdit'),
    legalRef: tl('impressum.legalRef'),
    contact: tl('impressum.contactLabel'),
    phone: tl('impressum.phoneLabel'),
    email: tl('impressum.emailLabel'),
    responsible: tl('impressum.responsibleLabel'),
    noData: editMode
      ? tl('impressum.noDataAdmin')
      : tl('impressum.noData'),
    editTitle: tl('impressum.editTitle'),
    cancel: tl('impressum.cancel'),
    save: tl('impressum.save'),
  }

  return (
    <CyberModalBackdrop open={isOpen} zIndex="z-[10000]" bgClass="bg-background/95 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-3xl bg-card border-2 border-primary/30 relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="h-12 bg-primary/10 border-b border-primary/30 flex items-center justify-between px-4 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-xs text-primary uppercase tracking-wider">
                  {isEditing ? t.titleEdit : t.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <div className="flex border border-primary/30 overflow-hidden">
                    <button
                      onClick={() => setLang('de')}
                      className={`px-2 py-0.5 text-[10px] font-mono transition-colors ${lang === 'de' ? 'bg-primary/20 text-primary' : 'text-primary/50 hover:text-primary/80'}`}
                    >
                      DE
                    </button>
                    <button
                      onClick={() => setLang('en')}
                      className={`px-2 py-0.5 text-[10px] font-mono transition-colors ${lang === 'en' ? 'bg-primary/20 text-primary' : 'text-primary/50 hover:text-primary/80'}`}
                    >
                      EN
                    </button>
                  </div>
                )}
                {isEditing && (
                  <div className="flex border border-primary/30 overflow-hidden">
                    <button
                      onClick={() => setEditLang('de')}
                      className={`px-2 py-0.5 text-[10px] font-mono transition-colors ${editLang === 'de' ? 'bg-primary/20 text-primary' : 'text-primary/50 hover:text-primary/80'}`}
                    >
                      DE
                    </button>
                    <button
                      onClick={() => setEditLang('en')}
                      className={`px-2 py-0.5 text-[10px] font-mono transition-colors ${editLang === 'en' ? 'bg-primary/20 text-primary' : 'text-primary/50 hover:text-primary/80'}`}
                    >
                      EN
                    </button>
                  </div>
                )}
                {editMode && onSave && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-primary hover:text-accent transition-colors"
                    title={t.editTitle}
                  >
                    <PencilSimple size={18} />
                  </button>
                )}
                <CyberCloseButton
                  onClick={() => { if (isEditing) { setIsEditing(false) } else { onClose() } }}
                  label={isEditing ? tl('common.back') : tl('common.close')}
                />
              </div>
            </div>

            <div className="pb-8 px-8 pt-6 font-mono text-sm space-y-6 overflow-y-auto">
              {isEditing ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">{editLang === 'de' ? t.legalRef : tl('impressum.legalRef', 'en')}</p>
                  <p className="text-xs text-primary/60 font-mono">
                    {editLang === 'de' ? tl('impressum.editingDe') : tl('impressum.editingEn')}
                  </p>

                  {editLang === 'de' ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="imp-name">{tl('impressum.nameLabel', 'de')}</Label>
                        <Input id="imp-name" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder={tl('impressum.namePlaceholder', 'de')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imp-careof">{tl('impressum.careOfLabel', 'de')}</Label>
                        <Input id="imp-careof" value={form.careOf || ''} onChange={(e) => update('careOf', e.target.value)} placeholder={tl('impressum.careOfPlaceholder', 'de')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imp-street">{tl('impressum.streetLabel', 'de')}</Label>
                        <Input id="imp-street" value={form.street || ''} onChange={(e) => update('street', e.target.value)} placeholder={tl('impressum.streetPlaceholder', 'de')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imp-zipcity">{tl('impressum.zipCityLabel', 'de')}</Label>
                        <Input id="imp-zipcity" value={form.zipCity || ''} onChange={(e) => update('zipCity', e.target.value)} placeholder={tl('impressum.zipCityPlaceholder', 'de')} />
                      </div>

                      <div className="border-t border-border pt-4 mt-4">
                        <p className="text-sm text-muted-foreground mb-4">{t.contact}</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imp-phone">{t.phone}</Label>
                        <Input id="imp-phone" value={form.phone || ''} onChange={(e) => update('phone', e.target.value)} placeholder="+49 ..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imp-email">{t.email}</Label>
                        <Input id="imp-email" value={form.email || ''} onChange={(e) => update('email', e.target.value)} placeholder="email@example.com" />
                      </div>

                      <div className="border-t border-border pt-4 mt-4">
                        <p className="text-sm text-muted-foreground mb-4">{tl('impressum.responsibleLabel', 'de')}</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imp-resp-name">{tl('impressum.responsibleNameLabel', 'de')}</Label>
                        <Input id="imp-resp-name" value={form.responsibleName || ''} onChange={(e) => update('responsibleName', e.target.value)} placeholder={tl('impressum.responsibleNamePlaceholder', 'de')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imp-resp-addr">{tl('impressum.responsibleAddressLabel', 'de')}</Label>
                        <Input id="imp-resp-addr" value={form.responsibleAddress || ''} onChange={(e) => update('responsibleAddress', e.target.value)} placeholder={tl('impressum.responsibleAddressPlaceholder', 'de')} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="imp-name-en">{tl('impressum.nameEnLabel', 'en')}</Label>
                        <Input id="imp-name-en" value={form.nameEn || ''} onChange={(e) => update('nameEn', e.target.value)} placeholder={form.name || tl('impressum.namePlaceholder', 'en')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imp-careof-en">{tl('impressum.careOfEnLabel', 'en')}</Label>
                        <Input id="imp-careof-en" value={form.careOfEn || ''} onChange={(e) => update('careOfEn', e.target.value)} placeholder={form.careOf || tl('impressum.careOfPlaceholder', 'en')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imp-street-en">{tl('impressum.streetEnLabel', 'en')}</Label>
                        <Input id="imp-street-en" value={form.streetEn || ''} onChange={(e) => update('streetEn', e.target.value)} placeholder={form.street || tl('impressum.streetPlaceholder', 'en')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imp-zipcity-en">{tl('impressum.zipCityEnLabel', 'en')}</Label>
                        <Input id="imp-zipcity-en" value={form.zipCityEn || ''} onChange={(e) => update('zipCityEn', e.target.value)} placeholder={form.zipCity || tl('impressum.zipCityPlaceholder', 'en')} />
                      </div>

                      <div className="border-t border-border pt-4 mt-4">
                        <p className="text-sm text-muted-foreground mb-4">{tl('impressum.contactShared', 'en')}</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imp-phone-en">{tl('impressum.phoneLabel', 'en')}</Label>
                        <Input id="imp-phone-en" value={form.phone || ''} onChange={(e) => update('phone', e.target.value)} placeholder={tl('impressum.phonePlaceholder', 'en')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imp-email-en">{tl('impressum.emailLabel', 'en')}</Label>
                        <Input id="imp-email-en" value={form.email || ''} onChange={(e) => update('email', e.target.value)} placeholder={tl('impressum.emailPlaceholder', 'en')} />
                      </div>

                      <div className="border-t border-border pt-4 mt-4">
                        <p className="text-sm text-muted-foreground mb-4">{tl('impressum.responsibleEn', 'en')}</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imp-resp-name-en">{tl('impressum.responsibleNameLabel', 'en')}</Label>
                        <Input id="imp-resp-name-en" value={form.responsibleNameEn || ''} onChange={(e) => update('responsibleNameEn', e.target.value)} placeholder={form.responsibleName || tl('impressum.responsibleNamePlaceholder', 'en')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imp-resp-addr-en">{tl('impressum.responsibleAddressLabel', 'en')}</Label>
                        <Input id="imp-resp-addr-en" value={form.responsibleAddressEn || ''} onChange={(e) => update('responsibleAddressEn', e.target.value)} placeholder={form.responsibleAddress || tl('impressum.responsibleAddressPlaceholder', 'en')} />
                      </div>
                    </>
                  )}

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>{t.cancel}</Button>
                    <Button onClick={handleSave} disabled={!form.name.trim()}>{t.save}</Button>
                  </div>
                </div>
              ) : (
                !impressum || !impressum.name ? (
                  <p className="text-muted-foreground text-center py-8">
                    {t.noData}
                  </p>
                ) : (
                  <>
                    <div>
                      <h2 className="text-primary text-base mb-3 tracking-wider">{t.legalRef}</h2>
                      <p className="text-foreground/80">{(lang === 'en' && impressum.nameEn) || impressum.name}</p>
                      {((lang === 'en' && impressum.careOfEn) || impressum.careOf) && <p className="text-foreground/80">c/o {(lang === 'en' && impressum.careOfEn) || impressum.careOf}</p>}
                      {((lang === 'en' && impressum.streetEn) || impressum.street) && <p className="text-foreground/80">{(lang === 'en' && impressum.streetEn) || impressum.street}</p>}
                      {((lang === 'en' && impressum.zipCityEn) || impressum.zipCity) && <p className="text-foreground/80">{(lang === 'en' && impressum.zipCityEn) || impressum.zipCity}</p>}
                    </div>

                    {(impressum.phone || impressum.email) && (
                      <div>
                        <h2 className="text-primary text-base mb-3 tracking-wider">{t.contact}</h2>
                        {impressum.phone && (
                          <p className="text-foreground/80 flex items-center gap-1">
                            {t.phone}: <ProtectedText text={impressum.phone} fontSize={14} />
                          </p>
                        )}
                        {impressum.email && (
                          <p className="text-foreground/80 flex items-center gap-1">
                            {t.email}: <ProtectedText text={impressum.email} fontSize={14} />
                          </p>
                        )}
                      </div>
                    )}

                    {((lang === 'en' && impressum.responsibleNameEn) || impressum.responsibleName) && (
                      <div>
                        <h2 className="text-primary text-base mb-3 tracking-wider">
                          {t.responsible}
                        </h2>
                        <p className="text-foreground/80">{(lang === 'en' && impressum.responsibleNameEn) || impressum.responsibleName}</p>
                        {((lang === 'en' && impressum.responsibleAddressEn) || impressum.responsibleAddress) && (
                          <p className="text-foreground/80">{(lang === 'en' && impressum.responsibleAddressEn) || impressum.responsibleAddress}</p>
                        )}
                      </div>
                    )}
                  </>
                )
              )}
            </div>
          </motion.div>
    </CyberModalBackdrop>
  )
}
