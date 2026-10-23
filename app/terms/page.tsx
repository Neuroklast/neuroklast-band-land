import type { Metadata } from 'next'
import { createPublicClient } from '@/lib/supabaseServer'
import { loadLegalConfig, DEFAULT_LEGAL_CONFIG, type LegalConfig } from '@/lib/legal-content'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { PublicBackLink } from '@/app/_components/public/PublicBackLink'

export const metadata: Metadata = {
  title: 'Terms of Service – NEUROKORE',
  description: 'Terms and conditions for the purchase and use of the NEUROKORE audio plugin.',
  alternates: { canonical: '/terms' },
  robots: { index: false, follow: false },
}

export const revalidate = 60

const FALLBACK_TERMS = `
NEUROKLAST AUDIO — TERMS OF SERVICE

1. Geltungsbereich
Diese Bedingungen gelten für den Kauf und die Nutzung der Software „NEUROKORE“ (Audio-Plugin) über diese Website. Vertragspartner ist der Betreiber dieser Website (siehe Impressum).

2. Vertragsschluss
Der Kauf erfolgt über Stripe Checkout. Mit der Zahlung und der Bestätigung dieser Bedingungen kommt ein Lizenzvertrag zustande. Die Lizenz ist persönlich und nicht übertragbar.

3. Lieferung & digitale Ware
Nach erfolgter Zahlung stellt der Kunde in seinem Kundenkonto unter /neurokore/account einen Lizenzschlüssel sowie einen Download-Link zur Verfügung. Mit Auslieferung des Schlüssels / Beginn des Downloads erlischt ein etwaiges Widerrufsrecht für Verbraucher, sofern nicht ausdrücklich abweichend vereinbart. Nähere Informationen zum Widerruf finden sich in der Widerrufsbelehrung.

7. Änderungen & Beendigung
Der Betreiber behält sich vor, Lizenzen bei Missbrauch, Zahlungsverzug oder Verstößen gegen diese Bedingungen zu sperren oder zu widerrufen.

8. Anwendbares Recht & Streitbeilegung
Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Für Verbraucher gilt der gesetzliche Wohnsitz als Gerichtsstand, soweit zwingend vorgeschgeführt.

Verwandte Seiten
- Lizenzumfang, Aktivierung, Mängelrechte: /license-terms (Lizenzbedingungen)
- Widerrufsbelehrung und Muster-Widerrufsformular: /withdrawal-policy
- Datenschutz: /privacy-policy
- Impressum / Betreiberkontakt: /legal-notice
`.trim()

export default async function TermsPage() {
  let config: LegalConfig = DEFAULT_LEGAL_CONFIG
  try {
    const supabase = createPublicClient()
    config = await loadLegalConfig(supabase)
  } catch {
    // defaults
  }

  const terms = config.termsText ? config.termsText.trim() : FALLBACK_TERMS

  return (
    <LegalPageShell>
      <section className="mx-auto max-w-3xl space-y-6 px-6 py-32">
        <PublicBackLink />
        <p className="font-mono text-sm tracking-widest">NEUROKLAST AUDIO — TERMS OF SERVICE</p>
        <h1 className="text-3xl font-bold">AGB — Verkauf &amp; Lizenz NEUROKORE</h1>
        {terms.split(/\n\n+/).map((block, i) => {
          const lines = block.split('\n')
          const [heading, ...rest] = lines
          const isHeading = lines.length > 1 && /^\d+\.\s/.test(heading.trim())
          return (
            <div key={i} className="space-y-2">
              {isHeading ? (
                <>
                  <h2 className="text-xl font-semibold">{heading}</h2>
                  {rest.join('\n') && (
                    <p className="leading-relaxed whitespace-pre-line">{rest.join('\n')}</p>
                  )}
                </>
              ) : (
                <p className="leading-relaxed whitespace-pre-line">{block}</p>
              )}
            </div>
          )
        })}
      </section>
    </LegalPageShell>
  )
}
