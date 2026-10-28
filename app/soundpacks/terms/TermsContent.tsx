'use client'

import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import { digitalPackTermsLocale, digitalPackTermsSections } from '@/lib/digital-packs/consumer-terms'
import { LegalDocumentContent } from '@/app/_components/public/LegalDocumentContent'

export function TermsContent() {
  const { locale } = useLocale()
  const lang = digitalPackTermsLocale(locale)
  return (
    <>
      <LegalDocumentContent
        title={lang === 'de' ? 'Kaufbedingungen für Sound- und Preset-Pakete' : 'Sound and Preset Pack Purchase Terms'}
        streamLabel="// AUDIO.PACK.PURCHASE"
        sections={digitalPackTermsSections(lang)}
        backHref="/soundpacks"
        backLabel={lang === 'de' ? 'Zu den Soundpacks' : 'Back to sound packs'}
      />
      <nav aria-label="Additional legal details" className="mx-auto flex max-w-3xl flex-wrap gap-5 px-5 pb-20 text-sm text-zinc-300">
        <Link href="/legal-notice" className="underline underline-offset-4">{lang === 'de' ? 'Impressum' : 'Legal notice'}</Link>
        <Link href="/withdrawal-policy" className="underline underline-offset-4">{lang === 'de' ? 'Widerrufsbelehrung' : 'Withdrawal policy'}</Link>
        <Link href="/withdrawal" className="underline underline-offset-4">{lang === 'de' ? 'Vertrag widerrufen' : 'Withdraw from contract'}</Link>
        <Link href="/privacy-policy" className="underline underline-offset-4">{lang === 'de' ? 'Datenschutz' : 'Privacy'}</Link>
      </nav>
    </>
  )
}
