import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PencilSimple } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import CyberCloseButton from '@/components/CyberCloseButton'
import SafeText from '@/components/SafeText'
import type { Datenschutz } from '@/lib/types'

interface DatenschutzWindowProps {
  isOpen: boolean
  onClose: () => void
  datenschutz?: Datenschutz
  impressumName?: string
  editMode?: boolean
  onSave?: (datenschutz: Datenschutz) => void
}

const defaultTextDE = `1. Datenschutz auf einen Blick

Allgemeine Hinweise
Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.

2. Hosting

Diese Website wird bei Vercel Inc. (340 S Lemon Ave #4133, Walnut, CA 91789, USA) gehostet. Die personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert. Hierbei kann es sich v. a. um IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten, Namen, Websitezugriffe und sonstige Daten, die über eine Website generiert werden, handeln. Der Einsatz des Hosters erfolgt im Interesse einer sicheren, schnellen und effizienten Bereitstellung unseres Online-Angebots (Art. 6 Abs. 1 lit. f DSGVO). Vercel verarbeitet Daten auch in den USA. Es liegt ein Angemessenheitsbeschluss der EU-Kommission (EU-US Data Privacy Framework) vor.

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
Diese Website lädt keine externen Schriftarten oder Tracking-Skripte. Alle Schriftarten und Gestaltungsressourcen werden lokal bereitgestellt. Es werden keine Cookies gesetzt.

Beim Abruf von Musikdaten werden Anfragen an die iTunes Search API (Apple Inc.) und den Odesli-Dienst (song.link) gestellt. Dabei wird Ihre IP-Adresse an diese Dienste übermittelt. Dies erfolgt auf Grundlage unseres berechtigten Interesses (Art. 6 Abs. 1 lit. f DSGVO) an der Darstellung aktueller Musikveröffentlichungen.

Zur Darstellung von Bildern kann diese Website den Bildproxy-Dienst wsrv.nl sowie Google-Dienste (lh3.googleusercontent.com, Google Drive) nutzen. Dabei wird Ihre IP-Adresse an diese Dienste übermittelt. Dies erfolgt auf Grundlage unseres berechtigten Interesses (Art. 6 Abs. 1 lit. f DSGVO) an der performanten Bereitstellung von Bildinhalten.

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

const defaultTextEN = `1. Privacy Policy at a Glance

General Information
The following information provides a simple overview of what happens to your personal data when you visit this website. Personal data is any data that can be used to personally identify you.

2. Hosting

This website is hosted by Vercel Inc. (340 S Lemon Ave #4133, Walnut, CA 91789, USA). The personal data collected on this website is stored on the host's servers. This may include IP addresses, contact requests, meta and communication data, contract data, contact details, names, website access, and other data generated through a website. The host is used in the interest of secure, fast and efficient provision of our online services (Art. 6(1)(f) GDPR). Vercel also processes data in the USA. An adequacy decision by the EU Commission (EU-US Data Privacy Framework) is in place.

3. General Information and Mandatory Disclosures

Data Protection
The operators of this website take the protection of your personal data very seriously. We treat your personal data confidentially and in accordance with the statutory data protection regulations and this privacy policy.

When you use this website, various personal data is collected. This privacy policy explains what data we collect and what we use it for.

Responsible Party
The party responsible for data processing on this website can be found in the imprint.

4. Data Collection on This Website

Server Log Files
The provider of this website automatically collects and stores information in so-called server log files, which your browser automatically transmits to us. These are:
- Browser type and version
- Operating system used
- Referrer URL
- Hostname of the accessing device
- Time of the server request
- IP address

This data is not merged with other data sources. The basis for data processing is Art. 6(1)(f) GDPR.

Local Storage (Local Storage / IndexedDB)
This website uses local browser storage (Local Storage and IndexedDB) to save settings and cached image data. This data does not leave your browser and is not transmitted to third parties. This is technically necessary storage.

External Services
This website does not load external fonts or tracking scripts. All fonts and design resources are provided locally. No cookies are set.

When retrieving music data, requests are made to the iTunes Search API (Apple Inc.) and the Odesli service (song.link). Your IP address is transmitted to these services. This is done on the basis of our legitimate interest (Art. 6(1)(f) GDPR) in displaying current music releases.

To display images, this website may use the image proxy service wsrv.nl as well as Google services (lh3.googleusercontent.com, Google Drive). Your IP address is transmitted to these services. This is done on the basis of our legitimate interest (Art. 6(1)(f) GDPR) in the performant delivery of image content.

5. Your Rights

You have the right at any time to:
- Obtain information about your stored personal data (Art. 15 GDPR)
- Request correction of inaccurate data (Art. 16 GDPR)
- Request deletion of your data (Art. 17 GDPR)
- Request restriction of processing (Art. 18 GDPR)
- Object to processing (Art. 21 GDPR)
- Request data portability (Art. 20 GDPR)
- Lodge a complaint with a supervisory authority (Art. 77 GDPR)

6. Links to External Websites

This website contains links to external websites (e.g. Spotify, YouTube, Instagram, etc.). By clicking these links you leave our website. We are not responsible for the data protection practices of these external websites. Please refer to their respective privacy policies.`

export default function DatenschutzWindow({ isOpen, onClose, datenschutz, impressumName, editMode, onSave }: DatenschutzWindowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const [lang, setLang] = useState<'de' | 'en'>('de')
  const [editLang, setEditLang] = useState<'de' | 'en'>('de')

  const defaultText = lang === 'de' ? defaultTextDE : defaultTextEN

  const displayText = (lang === 'de' ? datenschutz?.customText : datenschutz?.customTextEn) || defaultText.replace(
    lang === 'de'
      ? 'Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website entnehmen Sie bitte dem Impressum.'
      : 'The party responsible for data processing on this website can be found in the imprint.',
    impressumName
      ? lang === 'de'
        ? `Verantwortlich für die Datenverarbeitung auf dieser Website ist: ${impressumName}. Weitere Angaben entnehmen Sie bitte dem Impressum.`
        : `The party responsible for data processing on this website is: ${impressumName}. Further details can be found in the imprint.`
      : lang === 'de'
        ? 'Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website entnehmen Sie bitte dem Impressum.'
        : 'The party responsible for data processing on this website can be found in the imprint.'
  )

  useEffect(() => {
    if (isOpen) {
      setEditText(datenschutz?.customText || defaultTextDE)
      setIsEditing(false)
    }
  }, [isOpen, datenschutz])

  // Update the edit text when switching language in edit mode
  useEffect(() => {
    if (isEditing) {
      if (editLang === 'de') {
        setEditText(datenschutz?.customText || defaultTextDE)
      } else {
        setEditText(datenschutz?.customTextEn || defaultTextEN)
      }
    }
  }, [editLang, isEditing, datenschutz])

  const handleSave = () => {
    if (editLang === 'de') {
      onSave?.({ ...datenschutz, customText: editText })
    } else {
      onSave?.({ ...datenschutz, customTextEn: editText })
    }
    setIsEditing(false)
  }

  const renderText = (text: string) => {
    return text.split('\n\n').map((block, i) => {
      const trimmed = block.trim()
      if (/^\d+\.\s/.test(trimmed)) {
        return (
          <h2 key={i} className="text-primary text-base mb-2 tracking-wider mt-4">
            <SafeText>{trimmed}</SafeText>
          </h2>
        )
      }
      if (trimmed.startsWith('- ')) {
        const items = trimmed.split('\n').filter(l => l.startsWith('- '))
        return (
          <ul key={i} className="text-foreground/80 text-xs leading-relaxed list-disc pl-4 space-y-1">
            {items.map((item, j) => (
              <li key={j}><SafeText fontSize={12}>{item.replace(/^- /, '')}</SafeText></li>
            ))}
          </ul>
        )
      }
      return (
        <p key={i} className="text-foreground/80 text-xs leading-relaxed">
          <SafeText fontSize={12}>{trimmed}</SafeText>
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
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-3xl bg-card border-2 border-primary/30 relative overflow-hidden glitch-overlay-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 hud-scanline pointer-events-none opacity-20" />

            <div className="absolute top-0 left-0 right-0 h-12 bg-primary/10 border-b border-primary/30 flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-xs text-primary uppercase tracking-wider">
                  {isEditing ? (lang === 'de' ? 'DATENSCHUTZ BEARBEITEN' : 'EDIT PRIVACY POLICY') : (lang === 'de' ? 'DATENSCHUTZERKLÄRUNG' : 'PRIVACY POLICY')}
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
                    title={lang === 'de' ? 'Datenschutzerklärung bearbeiten' : 'Edit privacy policy'}
                  >
                    <PencilSimple size={18} />
                  </button>
                )}
                <CyberCloseButton
                  onClick={() => { if (isEditing) { setIsEditing(false) } else { onClose() } }}
                  label={isEditing ? 'BACK' : 'CLOSE'}
                />
              </div>
            </div>

            <div className="pt-16 pb-8 px-8 font-mono text-sm space-y-4 max-h-[80vh] overflow-y-auto">
              {isEditing ? (
                <div className="space-y-4">
                  <p className="text-xs text-primary/60 font-mono">
                    {editLang === 'de' ? '▸ Editing German version' : '▸ Editing English version'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {editLang === 'de'
                      ? 'Bearbeiten Sie die Datenschutzerklärung. Absätze werden durch Leerzeilen getrennt. Zeilen die mit einer Zahl + Punkt beginnen werden als Überschriften dargestellt. Zeilen die mit "- " beginnen werden als Aufzählung dargestellt.'
                      : 'Edit the privacy policy. Paragraphs are separated by blank lines. Lines starting with a number + period are rendered as headings. Lines starting with "- " are rendered as bullet points.'
                    }
                  </p>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full h-[50vh] bg-background border border-border rounded-sm p-4 text-xs font-mono text-foreground/90 resize-none focus:outline-none focus:border-primary/50"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>{editLang === 'de' ? 'Abbrechen' : 'Cancel'}</Button>
                    <Button onClick={handleSave}>{editLang === 'de' ? 'Speichern' : 'Save'}</Button>
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
