import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { getApiSecret } from '@/lib/api-secrets'
import { body, json, limit, sameOrigin } from '@/lib/neurokore/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const inputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.email().max(254).transform(value => value.toLowerCase()),
  orderReference: z.string().trim().min(3).max(500),
}).strict()

/**
 * No login, order match, reason or contract-validity decision at submission time.
 * Emails are sent together through Resend, with a receipt on a durable medium.
 * Keep this route reachable even when sales are disabled.
 */
export async function POST(request: Request) {
  try {
    sameOrigin(request)
    await limit(request, 'withdrawal-request', 5)
  } catch {
    return json({ error: 'Anfrage nicht zulässig oder zu viele Versuche.' }, 429)
  }
  const parsed = inputSchema.safeParse(await body(request).catch(() => null))
  if (!parsed.success) return json({ error: 'Bitte die Pflichtfelder überprüfen.' }, 400)
  const key = await getApiSecret('resend_api_key')
  const operator = process.env.WITHDRAWAL_EMAIL || process.env.CONTACT_EMAIL || 'booking@neuroklast.net'
  const from = process.env.CONTACT_FROM_EMAIL || 'NEUROKLAST <noreply@neuroklast.net>'
  if (!key) return json({ error: 'Widerruf vorübergehend nicht erreichbar. Bitte per E-Mail Kontakt aufnehmen.' }, 503)

  const { name, email, orderReference } = parsed.data
  const receivedAt = new Date().toISOString()
  const reference = randomUUID()
  const bodyText = [
    'Widerrufserklärung / Withdrawal notice',
    'Eingegangen / Received: ' + receivedAt,
    'Referenz / Reference: ' + reference,
    'Name: ' + name,
    'E-Mail: ' + email,
    'Vertrag / Order: ' + orderReference,
    '',
    'Erklärung: Ich widerrufe den bezeichneten Vertrag.',
    'Dies ist eine Eingangsbestätigung, keine Entscheidung über die rechtliche Wirksamkeit.',
  ].join('\n')

  try {
    const response = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
      headers: {
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/json',
        'Idempotency-Key': reference,
      },
      body: JSON.stringify([
        { from, to: [operator], reply_to: email, subject: '[Widerruf] ' + reference, text: bodyText },
        { from, to: [email], subject: 'Eingangsbestätigung deines Widerrufs – NEUROKLAST', text: bodyText },
      ]),
    })
    if (!response.ok) return json({ error: 'Übermittlung nicht möglich. Bitte per E-Mail widerrufen.' }, 503)
    const result: unknown = await response.json()
    if (!z.object({ data: z.array(z.object({ id: z.string() })).length(2) }).safeParse(result).success)
      return json({ error: 'Eingangsbestätigung konnte nicht bestätigt werden.' }, 503)
    return json({ receivedAt, reference })
  } catch {
    return json({ error: 'Übermittlung nicht möglich. Bitte per E-Mail widerrufen.' }, 503)
  }
}
