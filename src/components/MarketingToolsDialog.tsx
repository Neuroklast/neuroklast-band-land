import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CyberModalBackdrop from '@/components/CyberModalBackdrop'
import CyberCloseButton from '@/components/CyberCloseButton'
import { Megaphone, Envelope, LinkSimple, Copy, Check, FloppyDisk } from '@phosphor-icons/react'
import type { NewsletterSettings, ContactSettings } from '@/lib/types'

interface MarketingToolsDialogProps {
  open: boolean
  onClose: () => void
  newsletterSettings?: NewsletterSettings
  contactSettings?: ContactSettings
  onSaveNewsletter: (settings: NewsletterSettings) => void
  onSaveContact: (settings: ContactSettings) => void
}

type Tab = 'newsletter' | 'contact' | 'utm'

const DEFAULT_NEWSLETTER: NewsletterSettings = {
  enabled: false, title: 'Stay in the Loop', description: '', placeholder: 'Enter your email',
  buttonText: 'Subscribe', provider: 'none', showInFooter: true, showAfterGigs: false,
}

const DEFAULT_CONTACT: ContactSettings = {
  enabled: false, title: 'Get in Touch', description: '', emailForwardTo: '',
  successMessage: 'Message sent!', showSection: true,
}

const inputCls = 'bg-transparent border border-primary/30 px-3 py-2 text-xs font-mono text-foreground w-full'

export default function MarketingToolsDialog({
  open, onClose, newsletterSettings, contactSettings, onSaveNewsletter, onSaveContact,
}: MarketingToolsDialogProps) {
  const [tab, setTab] = useState<Tab>('newsletter')
  const [nl, setNl] = useState<NewsletterSettings>({ ...DEFAULT_NEWSLETTER })
  const [ct, setCt] = useState<ContactSettings>({ ...DEFAULT_CONTACT })
  const [utmBase, setUtmBase] = useState(typeof window !== 'undefined' ? window.location.origin : '')
  const [utmSource, setUtmSource] = useState('')
  const [utmMedium, setUtmMedium] = useState('')
  const [utmCampaign, setUtmCampaign] = useState('')
  const [copied, setCopied] = useState(false)
  const prevOpen = useRef(false)

  useEffect(() => {
    if (open && !prevOpen.current) {
      setNl({ ...DEFAULT_NEWSLETTER, ...newsletterSettings })
      setCt({ ...DEFAULT_CONTACT, ...contactSettings })
      setUtmBase(typeof window !== 'undefined' ? window.location.origin : '')
      setUtmSource('')
      setUtmMedium('')
      setUtmCampaign('')
      setCopied(false)
    }
    prevOpen.current = open
  }, [open, newsletterSettings, contactSettings])

  const generatedUrl = (() => {
    const params = new URLSearchParams()
    if (utmSource) params.set('utm_source', utmSource)
    if (utmMedium) params.set('utm_medium', utmMedium)
    if (utmCampaign) params.set('utm_campaign', utmCampaign)
    const qs = params.toString()
    return qs ? `${utmBase}?${qs}` : utmBase
  })()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tabBtn = (t: Tab, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setTab(t)}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider border rounded transition-colors ${
        tab === t ? 'bg-primary/20 border-primary text-primary' : 'border-primary/20 text-primary/40 hover:text-primary/70'
      }`}
    >
      {icon} {label}
    </button>
  )

  const toggle = (label: string, checked: boolean, onChange: (v: boolean) => void) => (
    <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-foreground/80">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="accent-primary w-3.5 h-3.5"
      />
      {label}
    </label>
  )

  return (
    <CyberModalBackdrop open={open} zIndex="z-[10001]" bgClass="bg-background/95 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-2xl mt-8 bg-card border-2 border-primary/30 relative overflow-hidden glitch-overlay-enter flex flex-col font-mono"
      >
        {/* Scanline overlay */}
        <div className="absolute inset-0 hud-scanline pointer-events-none opacity-20" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-primary/30">
          <div className="flex items-center gap-2 text-primary text-xs uppercase tracking-widest">
            <Megaphone size={14} weight="bold" /> Marketing Tools
          </div>
          <CyberCloseButton onClick={onClose} label="CLOSE" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 pt-3 pb-2">
          {tabBtn('newsletter', <Megaphone size={11} />, 'Newsletter')}
          {tabBtn('contact', <Envelope size={11} />, 'Contact')}
          {tabBtn('utm', <LinkSimple size={11} />, 'UTM Builder')}
        </div>

        <div className="h-px bg-primary/20 mx-4" />

        {/* Content */}
        <div className="px-4 py-3 space-y-3 overflow-y-auto max-h-[60vh] relative z-10">
          {/* Newsletter Settings */}
          {tab === 'newsletter' && (
            <div className="space-y-3">
              {toggle('Enabled', !!nl.enabled, v => setNl({ ...nl, enabled: v }))}
              <div className="space-y-1">
                <Label className="text-[10px] text-primary/60 uppercase">Title</Label>
                <Input className={inputCls} value={nl.title ?? ''} onChange={e => setNl({ ...nl, title: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-primary/60 uppercase">Description</Label>
                <Input className={inputCls} value={nl.description ?? ''} onChange={e => setNl({ ...nl, description: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-primary/60 uppercase">Placeholder Text</Label>
                <Input className={inputCls} value={nl.placeholder ?? ''} onChange={e => setNl({ ...nl, placeholder: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-primary/60 uppercase">Button Text</Label>
                <Input className={inputCls} value={nl.buttonText ?? ''} onChange={e => setNl({ ...nl, buttonText: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] text-primary/60 uppercase">Provider</Label>
                <div className="flex gap-1.5">
                  {(['none', 'mailchimp', 'brevo'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setNl({ ...nl, provider: p })}
                      className={`px-3 py-1 text-[10px] font-mono uppercase border rounded transition-colors ${
                        nl.provider === p ? 'bg-primary/20 border-primary text-primary' : 'border-primary/20 text-primary/40 hover:text-primary/70'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-px bg-primary/10" />
              <div className="flex gap-4">
                {toggle('Show in Footer', !!nl.showInFooter, v => setNl({ ...nl, showInFooter: v }))}
                {toggle('Show after Gigs', !!nl.showAfterGigs, v => setNl({ ...nl, showAfterGigs: v }))}
              </div>
              <div className="pt-2">
                <Button size="sm" onClick={() => { onSaveNewsletter(nl); onClose() }} className="gap-1.5 text-xs font-mono">
                  <FloppyDisk size={13} /> Save Newsletter
                </Button>
              </div>
            </div>
          )}

          {/* Contact Form Settings */}
          {tab === 'contact' && (
            <div className="space-y-3">
              {toggle('Enabled', !!ct.enabled, v => setCt({ ...ct, enabled: v }))}
              {toggle('Show Section', !!ct.showSection, v => setCt({ ...ct, showSection: v }))}
              <div className="h-px bg-primary/10" />
              <div className="space-y-1">
                <Label className="text-[10px] text-primary/60 uppercase">Title</Label>
                <Input className={inputCls} value={ct.title ?? ''} onChange={e => setCt({ ...ct, title: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-primary/60 uppercase">Description</Label>
                <Input className={inputCls} value={ct.description ?? ''} onChange={e => setCt({ ...ct, description: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-primary/60 uppercase">Email Forward To</Label>
                <Input className={inputCls} type="email" value={ct.emailForwardTo ?? ''} onChange={e => setCt({ ...ct, emailForwardTo: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-primary/60 uppercase">Success Message</Label>
                <Input className={inputCls} value={ct.successMessage ?? ''} onChange={e => setCt({ ...ct, successMessage: e.target.value })} />
              </div>
              <div className="pt-2">
                <Button size="sm" onClick={() => { onSaveContact(ct); onClose() }} className="gap-1.5 text-xs font-mono">
                  <FloppyDisk size={13} /> Save Contact
                </Button>
              </div>
            </div>
          )}

          {/* UTM Link Builder */}
          {tab === 'utm' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-[10px] text-primary/60 uppercase">Base URL</Label>
                <Input className={inputCls} value={utmBase} onChange={e => setUtmBase(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-primary/60 uppercase">Source</Label>
                <Input className={inputCls} placeholder="e.g. facebook, instagram" value={utmSource} onChange={e => setUtmSource(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-primary/60 uppercase">Medium</Label>
                <Input className={inputCls} placeholder="e.g. social, email" value={utmMedium} onChange={e => setUtmMedium(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-primary/60 uppercase">Campaign</Label>
                <Input className={inputCls} placeholder="e.g. spring2025" value={utmCampaign} onChange={e => setUtmCampaign(e.target.value)} />
              </div>
              <div className="h-px bg-primary/10" />
              <div className="space-y-1">
                <Label className="text-[10px] text-primary/60 uppercase">Generated URL</Label>
                <div className="flex gap-2">
                  <Input className={inputCls + ' flex-1'} value={generatedUrl} readOnly />
                  <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5 text-xs font-mono border-primary/30 shrink-0">
                    {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-primary/20 bg-primary/5 px-4 py-2 flex justify-end">
          <Button size="sm" variant="ghost" onClick={onClose} className="text-xs font-mono text-primary/50 hover:text-primary">
            Cancel
          </Button>
        </div>
      </motion.div>
    </CyberModalBackdrop>
  )
}
