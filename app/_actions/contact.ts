'use server'

import { getApiSecret } from '@/lib/api-secrets'
import { contactFormSchema } from '@/lib/contact-form'
import { checkContactRateLimit } from '@/lib/server-rate-limit'
import { db } from '@/lib/neurokore/server'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function submitContact(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const hp = (formData.get('_hp') as string | null) ?? ''
  // Honeypot filled → pretend success (do not tip off bots)
  if (hp.trim()) {
    return { success: true }
  }

  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
    _hp: '',
  }
  const parsed = contactFormSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: 'invalid' }
  }

  const allowed = await checkContactRateLimit()
  if (!allowed) {
    return { error: 'rate_limit' }
  }

  const { name, email, subject, message } = parsed.data
  // Contact details are self-reported. Matching orders helps support triage
  // but is never treated as proof of ownership of a licence.
  let contactId: string | null = null
  let matchingOrders = 0
  try {
    const client = db()
    const normalizedEmail = email.trim().toLowerCase()
    const { data: request, error: stored } = await client.from('plugin_contact_requests')
      .insert({ name, email: normalizedEmail, subject, message, delivery_state: 'pending' })
      .select('id').single()
    if (stored) throw stored
    contactId = request.id
    const matches = await client.from('plugin_orders')
      .select('id', { count: 'exact', head: true })
      .eq('email', normalizedEmail)
      .not('license_id', 'is', null)
      .is('test_deleted_at', null)
    if (!matches.error) matchingOrders = matches.count ?? 0
  } catch {
    // Email delivery remains independent from the optional support inbox.
    console.error('[contact] support inbox persistence unavailable')
  }
  const resendKey = await getApiSecret('resend_api_key')
  const contactEmail = process.env.CONTACT_EMAIL ?? 'booking@neuroklast.net'

  if (!resendKey) {
    if (process.env.NODE_ENV === 'production') {
      if (contactId) {
        await db().from('plugin_contact_requests').update({ delivery_state: 'failed' })
          .eq('id', contactId)
      }
      return { error: 'send_failed' }
    }
    // Local dev without a key: do not pretend a booking was delivered in production.
    console.info('[contact] message accepted (Resend not configured)', {
      subjectLength: subject.length,
      messageLength: message.length,
    })
    return { success: true }
  }

  const htmlBody = `
    <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <p><strong>Linked paid-licence orders for this unverified contact email:</strong> ${matchingOrders}</p>
    <p><em>Email matching is not identity verification.</em></p>
    <hr />
    <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
  `

  let res: Response
  try {
    res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + resendKey,
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? 'Neuroklast Website <noreply@neuroklast.net>',
      to: [contactEmail],
      reply_to: email,
      subject: '[Contact] ' + subject,
      html: htmlBody,
    }),
  })

  } catch {
    if (contactId) {
      await db().from('plugin_contact_requests').update({ delivery_state: 'failed' })
        .eq('id', contactId).then(() => undefined, () => undefined)
    }
    return { error: 'send_failed' }
  }
  if (contactId) {
    try {
      await db().from('plugin_contact_requests').update({
        delivery_state: res.ok ? 'accepted' : 'failed',
        provider_accepted_at: res.ok ? new Date().toISOString() : null,
      }).eq('id', contactId)
    } catch { console.error('[contact] delivery status persistence unavailable') }
  }
  if (!res.ok) return { error: 'send_failed' }
  return { success: true }
}
