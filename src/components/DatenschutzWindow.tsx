import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, PencilSimple } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import type { Datenschutz } from '@/lib/types'

interface DatenschutzWindowProps {
  isOpen: boolean
  onClose: () => void
  datenschutz?: Datenschutz
  impressumName?: string
  editMode?: boolean
  onSave?: (datenschutz: Datenschutz) => void
}

const defaultText = `1. Datenschutz auf einen Blick

Allgemeine Hinweise
Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.

2. Hosting

Diese Website wird bei einem externen Dienstleister gehostet (Hoster). Die personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert. Hierbei kann es sich v. a. um IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten, Namen, Websitezugriffe und sonstige Daten, die über eine Website generiert werden, handeln. Der Einsatz des Hosters erfolgt im Interesse einer sicheren, schnellen und effizienten Bereitstellung unseres Online-Angebots (Art. 6 Abs. 1 lit. f DSGVO).

3. Allgemeine Hinweise und Pflichtinformationen

Datenschutz
Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.

Wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben. Die vorliegende Datenschutzerklärung erläutert, welche Daten wir erheben und wofür wir sie nutzen.

Verantwortliche Stelle
Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website entnehmen Sie bitte dem Impressum.

4. Datenerfassung auf dieser Website

Server-Log-Dateien
Der Provider der Seiten erhebt und speichert automatisch Informationen in sogenannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
- Browsertyp und Browserversion
- Verwendetes Betriebssystem
- Referrer URL
- Hostname des zugreifenden Rechners
- Uhrzeit der Serveranfrage
- IP-Adresse

Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Grundlage für die Datenverarbeitung ist Art. 6 Abs. 1 lit. f DSGVO.

Lokale Speicherung (Local Storage / IndexedDB)
Diese Website nutzt die lokale Speicherung im Browser (Local Storage und IndexedDB), um Einstellungen und zwischengespeicherte Bilddaten zu speichern. Diese Daten verlassen Ihren Browser nicht und werden nicht an Dritte übermittelt. Es handelt sich um technisch notwendige Speicherung.

Externe Dienste
Diese Website lädt keine externen Schriftarten oder Tracking-Skripte. Alle Ressourcen werden lokal bereitgestellt. Es werden keine Cookies gesetzt.

Beim Abruf von Musikdaten werden Anfragen an die iTunes Search API und den Odesli-Dienst (song.link) gestellt. Dabei wird Ihre IP-Adresse an diese Dienste übermittelt. Dies erfolgt auf Grundlage unseres berechtigten Interesses (Art. 6 Abs. 1 lit. f DSGVO) an der Darstellung aktueller Musikveröffentlichungen.

5. Ihre Rechte

Sie haben jederzeit das Recht:
- Auskunft über Ihre gespeicherten personenbezogenen Daten zu erhalten (Art. 15 DSGVO)
- Berichtigung unrichtiger Daten zu verlangen (Art. 16 DSGVO)
- Löschung Ihrer Daten zu verlangen (Art. 17 DSGVO)
- Die Einschränkung der Verarbeitung zu verlangen (Art. 18 DSGVO)
- Der Verarbeitung zu widersprechen (Art. 21 DSGVO)
- Datenübertragbarkeit zu verlangen (Art. 20 DSGVO)
- Sich bei einer Aufsichtsbehörde zu beschweren (Art. 77 DSGVO)

6. Links zu externen Websites

Diese Website enthält Links zu externen Websites (z. B. Spotify, YouTube, Instagram, etc.). Beim Anklicken dieser Links verlassen Sie unsere Website. Für die Datenschutzpraktiken dieser externen Websites sind wir nicht verantwortlich. Bitte informieren Sie sich dort über die jeweiligen Datenschutzbestimmungen.`

export default function DatenschutzWindow({ isOpen, onClose, datenschutz, impressumName, editMode, onSave }: DatenschutzWindowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState('')

  const displayText = datenschutz?.customText || defaultText.replace(
    'Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website entnehmen Sie bitte dem Impressum.',
    impressumName
      ? `Verantwortlich für die Datenverarbeitung auf dieser Website ist: ${impressumName}. Weitere Angaben entnehmen Sie bitte dem Impressum.`
      : 'Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website entnehmen Sie bitte dem Impressum.'
  )

  useEffect(() => {
    if (isOpen) {
      setEditText(datenschutz?.customText || defaultText)
      setIsEditing(false)
    }
  }, [isOpen, datenschutz])

  const handleSave = () => {
    onSave?.({ customText: editText })
    setIsEditing(false)
  }

  const renderText = (text: string) => {
    return text.split('\n\n').map((block, i) => {
      const trimmed = block.trim()
      if (/^\d+\.\s/.test(trimmed)) {
        return (
          <h2 key={i} className="text-primary text-base mb-2 tracking-wider mt-4">
            {trimmed}
          </h2>
        )
      }
      if (trimmed.startsWith('- ')) {
        const items = trimmed.split('\n').filter(l => l.startsWith('- '))
        return (
          <ul key={i} className="text-foreground/80 text-xs leading-relaxed list-disc pl-4 space-y-1">
            {items.map((item, j) => (
              <li key={j}>{item.replace(/^- /, '')}</li>
            ))}
          </ul>
        )
      }
      return (
        <p key={i} className="text-foreground/80 text-xs leading-relaxed">
          {trimmed}
        </p>
      )
    })
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
                  {isEditing ? 'DATENSCHUTZ BEARBEITEN' : 'DATENSCHUTZERKLÄRUNG'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {editMode && onSave && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-primary hover:text-accent transition-colors"
                    title="Datenschutzerklärung bearbeiten"
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

            <div className="pt-16 pb-8 px-8 font-mono text-sm space-y-4 max-h-[80vh] overflow-y-auto">
              {isEditing ? (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Bearbeiten Sie die Datenschutzerklärung. Absätze werden durch Leerzeilen getrennt.
                    Zeilen die mit einer Zahl + Punkt beginnen werden als Überschriften dargestellt.
                    Zeilen die mit &quot;- &quot; beginnen werden als Aufzählung dargestellt.
                  </p>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full h-[50vh] bg-background border border-border rounded-sm p-4 text-xs font-mono text-foreground/90 resize-none focus:outline-none focus:border-primary/50"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Abbrechen</Button>
                    <Button onClick={handleSave}>Speichern</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {renderText(displayText)}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
