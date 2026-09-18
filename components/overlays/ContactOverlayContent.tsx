import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PaperPlaneTilt } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { AdminSettings, DecorativeTexts } from '@/lib/types'
import { submitContact } from '@/app/_actions/contact'
import { contactFormSchema } from '@/lib/contact-form'
import { OverlayItem, OverlayReveal } from '@/components/motion/overlay-motion'

interface ContactOverlayContentProps {
  adminSettings: AdminSettings | undefined
  decorativeTexts?: DecorativeTexts
  closing?: boolean
}

export function ContactOverlayContent({
  adminSettings,
  decorativeTexts,
  closing,
}: ContactOverlayContentProps) {
  const streamLabel = decorativeTexts?.contactStreamLabel ?? '// CONTACT.INTERFACE'
  const formLabel = decorativeTexts?.contactFormLabel ?? '// CONTACT.FORM'
  const statusLabel = decorativeTexts?.contactStatusLabel ?? '// SYSTEM.STATUS: [ACTIVE]'
  return (
    <OverlayReveal
      data-theme-color="card border input ring"
      className="mt-8 space-y-6"
      closing={closing}
      stagger={0.05}
    >
      <div>
        <OverlayItem delay={0.04}>
          <div className="data-label mb-2">{streamLabel}</div>
        </OverlayItem>
        <OverlayItem delay={0.08}>
          <h2
            className="mb-4 font-mono text-4xl font-bold uppercase hover-chromatic crt-flash-in md:text-5xl"
            data-text="CONTACT"
          >
            CONTACT
          </h2>
        </OverlayItem>
      </div>

      <div className="space-y-6 text-foreground/90">
        {(adminSettings?.contact?.managementName || adminSettings?.contact?.managementEmail) && (
          <OverlayItem className="cyber-grid p-4" delay={0.14}>
            <div className="data-label mb-3">Management</div>
            <div className="space-y-2 font-mono text-sm">
              {adminSettings?.contact?.managementName && (
                <p>{adminSettings.contact.managementName}</p>
              )}
              {adminSettings?.contact?.managementEmail && (
                <p>
                  E-Mail:{' '}
                  <a
                    href={`mailto:${adminSettings.contact.managementEmail}`}
                    className="text-primary hover:underline"
                  >
                    {adminSettings.contact.managementEmail}
                  </a>
                </p>
              )}
            </div>
          </OverlayItem>
        )}

        {adminSettings?.contact?.bookingEmail && (
          <OverlayItem className="cyber-grid p-4" delay={0.18}>
            <div className="data-label mb-3">Booking</div>
            <div className="space-y-2 font-mono text-sm">
              <p>
                E-Mail:{' '}
                <a
                  href={`mailto:${adminSettings.contact.bookingEmail}`}
                  className="text-primary hover:underline"
                >
                  {adminSettings.contact.bookingEmail}
                </a>
              </p>
            </div>
          </OverlayItem>
        )}

        {adminSettings?.contact?.pressEmail && (
          <OverlayItem className="cyber-grid p-4" delay={0.22}>
            <div className="data-label mb-3">Press / Media</div>
            <div className="space-y-2 font-mono text-sm">
              <p>
                E-Mail:{' '}
                <a
                  href={`mailto:${adminSettings.contact.pressEmail}`}
                  className="text-primary hover:underline"
                >
                  {adminSettings.contact.pressEmail}
                </a>
              </p>
            </div>
          </OverlayItem>
        )}

        <OverlayItem className="cyber-grid p-6" delay={0.28}>
          <div className="data-label mb-4">{formLabel}</div>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const form = e.currentTarget
              const formData = new FormData(form)
              const data = {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                subject: formData.get('subject') as string,
                message: formData.get('message') as string,
                _hp: (formData.get('_hp') as string) ?? '',
              }

              const validation = contactFormSchema.safeParse(data)
              if (!validation.success) {
                toast.error(validation.error.issues[0]?.message || 'Please check your input')
                return
              }

              const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement | null
              if (submitBtn) submitBtn.disabled = true
              toast.loading('Sending message...', { id: 'contact-submit' })

              const fd = new FormData()
              fd.set('name', data.name)
              fd.set('email', data.email)
              fd.set('subject', data.subject)
              fd.set('message', data.message)
              fd.set('_hp', data._hp ?? '')
              const result = await submitContact(null, fd)

              if (result.success) {
                toast.success('Message sent successfully!', { id: 'contact-submit' })
                form.reset()
              } else {
                toast.error(result.error || 'Failed to send message', { id: 'contact-submit' })
              }

              if (submitBtn) submitBtn.disabled = false
            }}
            className="space-y-4"
          >
            {/* Honeypot field — hidden from real users */}
            <input
              type="text"
              name="_hp"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label className="font-mono text-xs uppercase tracking-wide">
                  {adminSettings?.contact?.formNameLabel || 'Name'}
                </Label>
                <Input
                  name="name"
                  required
                  maxLength={100}
                  placeholder={adminSettings?.contact?.formNamePlaceholder || 'Your name'}
                  className="mt-1 border-border bg-card font-mono"
                />
              </div>
              <div>
                <Label className="font-mono text-xs uppercase tracking-wide">
                  {adminSettings?.contact?.formEmailLabel || 'Email'}
                </Label>
                <Input
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  placeholder={adminSettings?.contact?.formEmailPlaceholder || 'your@email.com'}
                  className="mt-1 border-border bg-card font-mono"
                />
              </div>
            </div>
            <div>
              <Label className="font-mono text-xs uppercase tracking-wide">
                {adminSettings?.contact?.formSubjectLabel || 'Subject'}
              </Label>
              {adminSettings?.contact?.contactSubjects &&
              adminSettings.contact.contactSubjects.length > 0 ? (
                <select
                  name="subject"
                  required
                  defaultValue=""
                  className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="" disabled>
                    {adminSettings?.contact?.formSubjectPlaceholder || 'Select a subject...'}
                  </option>
                  {adminSettings.contact.contactSubjects.map((s, i) => (
                    <option key={i} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  name="subject"
                  required
                  maxLength={200}
                  placeholder={adminSettings?.contact?.formSubjectPlaceholder || 'Subject'}
                  className="mt-1 border-border bg-card font-mono"
                />
              )}
            </div>
            <div>
              <Label className="font-mono text-xs uppercase tracking-wide">
                {adminSettings?.contact?.formMessageLabel || 'Message'}
              </Label>
              <Textarea
                name="message"
                required
                maxLength={5000}
                placeholder={adminSettings?.contact?.formMessagePlaceholder || 'Your message...'}
                className="mt-1 min-h-[120px] border-border bg-card font-mono"
              />
            </div>
            <Button type="submit" className="w-full font-mono uppercase hover-glitch">
              <PaperPlaneTilt className="mr-2 h-5 w-5" />
              <span className="hover-chromatic">
                {adminSettings?.contact?.formButtonText || 'Send Message'}
              </span>
            </Button>
          </form>
        </OverlayItem>
      </div>

      <OverlayItem className="border-t border-border pt-6" delay={0.36}>
        <div className="data-label">{statusLabel}</div>
      </OverlayItem>
    </OverlayReveal>
  )
}
