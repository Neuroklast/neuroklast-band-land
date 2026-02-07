import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, PencilSimple } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ProtectedText from '@/components/ProtectedText'
import type { Impressum } from '@/lib/types'

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

  useEffect(() => {
    if (isOpen) {
      setForm(impressum || emptyImpressum)
      setIsEditing(false)
    }
  }, [isOpen, impressum])

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
    })
    setIsEditing(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-3xl bg-card border-2 border-primary/30 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 hud-scanline pointer-events-none opacity-20" />

            <div className="absolute top-0 left-0 right-0 h-12 bg-primary/10 border-b border-primary/30 flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-xs text-primary uppercase tracking-wider">
                  {isEditing ? 'IMPRESSUM BEARBEITEN' : 'IMPRESSUM'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {editMode && onSave && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-primary hover:text-accent transition-colors"
                    title="Impressum bearbeiten"
                  >
                    <PencilSimple size={18} />
                  </button>
                )}
                <button
                  onClick={() => { if (isEditing) { setIsEditing(false) } else { onClose() } }}
                  className="text-primary hover:text-accent transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="pt-16 pb-8 px-8 font-mono text-sm space-y-6 max-h-[80vh] overflow-y-auto">
              {isEditing ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Angaben gemäß § 5 DDG</p>

                  <div className="space-y-2">
                    <Label htmlFor="imp-name">Name / Bandmitglieder</Label>
                    <Input id="imp-name" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Vorname Nachname oder Bandmitglieder" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imp-careof">c/o Impressum-Service</Label>
                    <Input id="imp-careof" value={form.careOf || ''} onChange={(e) => update('careOf', e.target.value)} placeholder="Name des Impressum-Services" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imp-street">Straße und Hausnummer</Label>
                    <Input id="imp-street" value={form.street || ''} onChange={(e) => update('street', e.target.value)} placeholder="Straße und Hausnummer" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imp-zipcity">PLZ und Ort</Label>
                    <Input id="imp-zipcity" value={form.zipCity || ''} onChange={(e) => update('zipCity', e.target.value)} placeholder="PLZ und Ort" />
                  </div>

                  <div className="border-t border-border pt-4 mt-4">
                    <p className="text-sm text-muted-foreground mb-4">Kontakt</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imp-phone">Telefon</Label>
                    <Input id="imp-phone" value={form.phone || ''} onChange={(e) => update('phone', e.target.value)} placeholder="+49 ..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imp-email">E-Mail</Label>
                    <Input id="imp-email" value={form.email || ''} onChange={(e) => update('email', e.target.value)} placeholder="email@example.com" />
                  </div>

                  <div className="border-t border-border pt-4 mt-4">
                    <p className="text-sm text-muted-foreground mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imp-resp-name">Name</Label>
                    <Input id="imp-resp-name" value={form.responsibleName || ''} onChange={(e) => update('responsibleName', e.target.value)} placeholder="Name der verantwortlichen Person" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imp-resp-addr">Anschrift</Label>
                    <Input id="imp-resp-addr" value={form.responsibleAddress || ''} onChange={(e) => update('responsibleAddress', e.target.value)} placeholder="Anschrift oder Service-Adresse" />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Abbrechen</Button>
                    <Button onClick={handleSave} disabled={!form.name.trim()}>Speichern</Button>
                  </div>
                </div>
              ) : (
                !impressum || !impressum.name ? (
                  <p className="text-muted-foreground text-center py-8">
                    {editMode
                      ? 'Noch kein Impressum hinterlegt. Klicke auf den Stift oben rechts, um es zu bearbeiten.'
                      : 'Impressum wird noch eingerichtet.'}
                  </p>
                ) : (
                  <>
                    <div>
                      <h2 className="text-primary text-base mb-3 tracking-wider">Angaben gemäß § 5 DDG</h2>
                      <p className="text-foreground/80">{impressum.name}</p>
                      {impressum.careOf && <p className="text-foreground/80">c/o {impressum.careOf}</p>}
                      {impressum.street && <p className="text-foreground/80">{impressum.street}</p>}
                      {impressum.zipCity && <p className="text-foreground/80">{impressum.zipCity}</p>}
                    </div>

                    {(impressum.phone || impressum.email) && (
                      <div>
                        <h2 className="text-primary text-base mb-3 tracking-wider">Kontakt</h2>
                        {impressum.phone && (
                          <p className="text-foreground/80 flex items-center gap-1">
                            Telefon: <ProtectedText text={impressum.phone} fontSize={14} />
                          </p>
                        )}
                        {impressum.email && (
                          <p className="text-foreground/80 flex items-center gap-1">
                            E-Mail: <ProtectedText text={impressum.email} fontSize={14} />
                          </p>
                        )}
                      </div>
                    )}

                    {impressum.responsibleName && (
                      <div>
                        <h2 className="text-primary text-base mb-3 tracking-wider">
                          VERANTWORTLICH FÜR DEN INHALT NACH § 18 ABS. 2 MSTVV
                        </h2>
                        <p className="text-foreground/80">{impressum.responsibleName}</p>
                        {impressum.responsibleAddress && (
                          <p className="text-foreground/80">{impressum.responsibleAddress}</p>
                        )}
                      </div>
                    )}
                  </>
                )
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
