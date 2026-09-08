'use client'

import { useActionState } from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import { resolveSectionHeading } from '@/lib/section-display'
import { SectionWrapper, SectionHeading, SectionIntro } from './SectionWrapper'
import { submitContact } from '@/app/_actions/contact'

const fieldClass = 'nk-os-field'

interface ContactSectionProps {
  heading?: string
  intro?: string
  privacyPolicyUrl?: string
}

export function ContactSection({
  heading,
  intro,
  privacyPolicyUrl = '/privacy-policy',
}: ContactSectionProps) {
  const { t } = useLocale()
  const [state, formAction, pending] = useActionState(submitContact, null)
  const title = resolveSectionHeading(heading, 'contact', t)
  const errorMessage =
    state?.error === 'invalid'
      ? t('contact.errorInvalid')
      : state?.error === 'rate_limit'
        ? t('contact.errorRateLimit')
        : state?.error
          ? t('contact.sendError')
          : null

  return (
    <SectionWrapper id="contact" data-theme-color="foreground card border input">
      <SectionHeading sectionId="contact" dataText={title}>{title}</SectionHeading>
      <SectionIntro sectionId="contact">{intro}</SectionIntro>

      {state?.success ? (
        <p role="status" aria-live="polite" className="mb-4 border border-border px-4 py-3 font-mono text-sm text-foreground">
          {t('contact.success')}
        </p>
      ) : null}

      <form action={formAction} className="flex w-full flex-col gap-4">
          <input
            type="text"
            name="_hp"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="sr-only"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className="mb-1 block font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {t('contact.nameLabel')}
              </label>
              <input id="contact-name" name="name" required maxLength={100} className={fieldClass} autoComplete="name" placeholder={t('contact.namePlaceholder')} />
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-1 block font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {t('contact.emailLabel')}
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                maxLength={254}
                className={fieldClass}
                autoComplete="email"
                placeholder={t('contact.emailPlaceholder')}
              />
            </div>
          </div>
          <div>
            <label htmlFor="contact-subject" className="mb-1 block font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {t('contact.subjectLabel')}
            </label>
            <input id="contact-subject" name="subject" required maxLength={200} className={fieldClass} placeholder={t('contact.subjectPlaceholder')} />
          </div>
          <div>
            <label htmlFor="contact-message" className="mb-1 block font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {t('contact.messageLabel')}
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              minLength={10}
              maxLength={5000}
              rows={5}
              className={`${fieldClass} min-h-[8rem] resize-y`}
              aria-invalid={Boolean(errorMessage)}
              aria-describedby={errorMessage ? 'contact-form-error' : undefined}
              placeholder={t('contact.messagePlaceholder')}
            />
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            {t('contact.description')}{' '}
            <a
              href={privacyPolicyUrl}
              className="text-foreground underline underline-offset-2 transition-colors hover:text-primary"
            >
              {t('footer.privacy')}
            </a>
            .
          </p>
          {errorMessage ? (
            <p id="contact-form-error" role="alert" aria-live="assertive" className="font-mono text-xs text-destructive">
              {errorMessage}
            </p>
          ) : null}
          <div>
            <button
              type="submit"
              disabled={pending}
              className="nk-os-btn nk-os-btn--fill min-h-[44px] disabled:opacity-50"
            >
              {pending ? t('contact.sending') : t('contact.send')}
            </button>
          </div>
        </form>
    </SectionWrapper>
  )
}