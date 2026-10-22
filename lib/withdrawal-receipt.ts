import 'server-only'
import { getApiSecret } from '@/lib/api-secrets'
import { loadLegalConfig } from '@/lib/legal-content'
import { COMMERCE_ACTIONS } from '@/lib/commerce-actions-i18n'
import type { LegalLocale } from '@/lib/legal-i18n'
import { db } from '@/lib/neurokore/server'

export interface WithdrawalNotice {
  id: string
  name: string
  email: string
  contract_details: string
  locale: LegalLocale
  received_at: string
  customer_receipt_at: string | null
  provider_notice_at: string | null
}

export function withdrawalReceiptText(record: WithdrawalNotice): string {
  const translated = COMMERCE_ACTIONS[record.locale] ?? COMMERCE_ACTIONS.en
  return [
    'NEUROKLAST | Withdrawal declaration / Widerrufserklärung',
    'Reference: ' + record.id,
    'Received (UTC): ' + record.received_at,
    'Name: ' + record.name,
    'Email: ' + record.email,
    'Contract: ' + record.contract_details,
    '',
    translated.declaration,
    translated.notDecision,
  ].join('\n')
}

/**
 * Returns false if the provider has not accepted both messages.
 * Callers persist the declaration before attempting email delivery.
 * The idempotency key prevents repeated user and provider emails on retries.
 */
export async function attemptWithdrawalReceipt(record: WithdrawalNotice): Promise<boolean> {
  const key = await getApiSecret('resend_api_key')
  if (!key) return false
  const client = db()
  const config = await loadLegalConfig(client)
  const operator = process.env.WITHDRAWAL_EMAIL || process.env.CONTACT_EMAIL || config.email
  const from = process.env.CONTACT_FROM_EMAIL
  if (!operator || !from) return false
  const copy = COMMERCE_ACTIONS[record.locale] ?? COMMERCE_ACTIONS.en
  const text = withdrawalReceiptText(record)
  try {
    const response = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
      headers: {
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/json',
        'Idempotency-Key': 'withdrawal-' + record.id,
      },
      body: JSON.stringify([
        { from, to: [operator], reply_to: record.email, subject: '[Withdrawal] ' + record.id, text },
        { from, to: [record.email], subject: copy.done + ' | NEUROKLAST', text },
      ]),
    })
    if (!response.ok) return false
    const body: unknown = await response.json()
    if (!body || typeof body !== 'object' || !('data' in body) ||
      !Array.isArray(body.data) || body.data.length !== 2 ||
      !body.data.every((item: unknown) => Boolean(item && typeof item === 'object' && 'id' in item)))
      return false
    const timestamp = new Date().toISOString()
    const { error } = await client.from('plugin_withdrawal_notices')
      .update({ customer_receipt_at: timestamp, provider_notice_at: timestamp })
      .eq('id', record.id)
    return !error
  } catch {
    return false
  }
}
