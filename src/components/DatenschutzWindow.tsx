import { useState, useEffect, startTransition } from 'react'
import { motion } from 'framer-motion'
import CyberModalBackdrop from '@/components/CyberModalBackdrop'
import { PencilSimple } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import CyberCloseButton from '@/components/CyberCloseButton'
import SafeText from '@/components/SafeText'
import type { Datenschutz } from '@/lib/types'
import { t as i18nT } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

interface DatenschutzWindowProps {
  open: boolean
  onClose: () => void
  datenschutz?: Datenschutz
  impressumName?: string
  editMode?: boolean
  onSave?: (datenschutz: Datenschutz) => void
}

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

Embedded YouTube Videos
This website may embed videos from YouTube (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland). YouTube's enhanced privacy mode is used (domain: youtube-nocookie.com), meaning YouTube does not set cookies until you play the video. When you play a video, your IP address is transmitted to YouTube. This is done on the basis of our legitimate interest (Art. 6(1)(f) GDPR) in embedding video content. For more information, see YouTube's privacy policy: https://policies.google.com/privacy

Local Music Player
This website provides its own music player that plays audio files directly from our own server. No data is transmitted to third-party providers. No external services are integrated and no cookies are set.

5. Protection Against Automated Attacks (Rate Limiting)

To protect this website from automated attacks (e.g. brute-force attacks, denial of service), a request rate limiter is employed. The number of permitted API requests per user is limited to a maximum of 5 within a 10-second window. If the limit is exceeded, the request is rejected with HTTP status code 429 (Too Many Requests).

IP address pseudonymisation: Your IP address is converted into a non-reversible character string using a cryptographic one-way hash function (SHA-256) combined with a secret system-wide salt value before any processing takes place. Your IP address is never stored or logged in plaintext. The hashed data is retained only for the duration of the time window (10 seconds) and is automatically deleted thereafter.

The legal basis for this processing is our legitimate interest in protecting the website and its users from automated attacks pursuant to Art. 6(1)(f) GDPR. The measure is proportionate as only pseudonymised data with the shortest possible retention period is processed and no profiling takes place.

6. Input Validation

All inputs to the application programming interfaces (APIs) of this website are checked against strict validation schemas to ensure the integrity of the system and the protection of your data. Invalid or manipulated inputs are automatically rejected. No personal data is stored in this process.

7. Your Rights

You have the right at any time to:
- Obtain information about your stored personal data (Art. 15 GDPR)
- Request correction of inaccurate data (Art. 16 GDPR)
- Request deletion of your data (Art. 17 GDPR)
- Request restriction of processing (Art. 18 GDPR)
- Object to processing (Art. 21 GDPR)
- Request data portability (Art. 20 GDPR)
- Lodge a complaint with a supervisory authority (Art. 77 GDPR)

8. Links to External Websites

This website contains links to external websites (e.g. Spotify, YouTube, Instagram, etc.). By clicking these links you leave our website. We are not responsible for the data protection practices of these external websites. Please refer to their respective privacy policies.`

export default function DatenschutzWindow({ open, onClose, datenschutz, impressumName, editMode, onSave }: DatenschutzWindowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState('')

  const tl = (key: string, l: Locale = 'en') => i18nT(key, l)

  const defaultText = defaultTextEN

  // Site is English-only: display and edit the English version (customTextEn).
  // Legacy customText (German) is preserved in the data model but not shown.
  const displayText = (datenschutz?.customTextEn) || defaultText.replace(
    'The party responsible for data processing on this website can be found in the imprint.',
    impressumName
      ? `The party responsible for data processing on this website is: ${impressumName}. Further details can be found in the imprint.`
      : 'The party responsible for data processing on this website can be found in the imprint.'
  )

  useEffect(() => {
    if (open) {
      startTransition(() => {
        setEditText(datenschutz?.customTextEn || defaultTextEN)
        setIsEditing(false)
      })
    }
  }, [open, datenschutz])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Update the edit text when entering edit mode
  useEffect(() => {
    if (isEditing) {
      startTransition(() => {
        setEditText(datenschutz?.customTextEn || defaultTextEN)
      })
    }
  }, [isEditing, datenschutz])

  const handleSave = () => {
    onSave?.({ ...datenschutz, customTextEn: editText })
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
    <CyberModalBackdrop open={open} zIndex="z-[10000]" bgClass="bg-background/95 backdrop-blur-sm">
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
                  {isEditing ? tl('datenschutz.titleEdit', 'en') : tl('datenschutz.title', 'en')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {editMode && onSave && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-primary hover:text-accent transition-colors"
                    title={tl('datenschutz.editTooltip', 'en')}
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

            <div className="pb-8 px-8 pt-6 font-mono text-sm space-y-4 overflow-y-auto">
              {isEditing ? (
                <div className="space-y-4">
                  <p className="text-xs text-primary/60 font-mono">
                    {tl('datenschutz.editingEn', 'en')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tl('datenschutz.instructions', 'en')}
                  </p>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full h-[50vh] bg-background border border-border rounded-sm p-4 text-xs font-mono text-foreground/90 resize-none focus:outline-none focus:border-primary/50"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>{tl('datenschutz.cancel', 'en')}</Button>
                    <Button onClick={handleSave}>{tl('datenschutz.save', 'en')}</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {renderText(displayText)}
                </div>
              )}
            </div>
          </motion.div>
    </CyberModalBackdrop>
  )
}
