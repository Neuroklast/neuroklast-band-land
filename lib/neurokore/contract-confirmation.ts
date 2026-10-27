import 'server-only'
import { z } from 'zod'
import { getApiSecret } from '@/lib/api-secrets'
import { loadLegalConfig, formatServiceAddress } from '@/lib/legal-content'
import { db, origin } from '@/lib/neurokore/server'
import { COMMERCE_LEGAL_COPY, commerceSections } from '@/lib/commerce-legal-copy'
import { contractDocumentText, contractEmailText, contractEmailHtml } from '@/lib/neurokore/email-format'
import { WITHDRAWAL_COPY } from '@/lib/legal-withdrawal-i18n'
import { LEGAL_LOCALES } from '@/lib/legal-i18n'
import { localizedLegalPath } from '@/lib/legal-routes'
import { COMMERCE_TERMS_VERSION } from '@/lib/commerce-version'

export const sessionSchema = z.object({
  id: z.string(),
  livemode: z.boolean(),
  mode: z.literal('payment'),
  payment_status: z.literal('paid'),
  client_reference_id: z.uuid(),
  payment_intent: z.string(),
  customer_email: z.email(),
  amount_total: z.number().int().nonnegative(),
  currency: z.string().min(3).max(3),
  metadata: z.object({ locale: z.enum(LEGAL_LOCALES).optional(), terms_version: z.string().optional(), environment: z.string().optional(), plugin_order: z.uuid().optional() }).nullable().optional(),
  line_items: z.object({
    has_more: z.literal(false),
    data: z.array(z.object({
      quantity: z.literal(1),
      price: z.object({ id: z.string() }),
    })).length(1),
  }),
})

function formatChargedAmount(amount: number, currency: string, locale: string): string {
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency: currency.toUpperCase() })
  const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2
  return formatter.format(amount / Math.pow(10, digits))
}

/** Permanent contract confirmation. Do not claim withdrawal rights disappeared. */
export async function sendContractConfirmation(
  client: ReturnType<typeof db>,
  order: { id: string; product_id: string; email: string; terms_snapshot: string | null; licence_snapshot: string | null; terms_version: string | null },
  session: z.infer<typeof sessionSchema>,
): Promise<void> {
  const [productResult, legal, resendKey] = await Promise.all([
    client.from('products').select('title,slug,short_description,system_requirements').eq('id', order.product_id).single(),
    loadLegalConfig(client),
    getApiSecret('resend_api_key'),
  ])
  if (productResult.error || !productResult.data || !resendKey) throw new Error('Confirmation prerequisites unavailable')

  const product = productResult.data
  const operator = formatServiceAddress(legal)
  const siteUrl = origin()
  const locale = session.metadata?.locale ?? 'en'
  const translations = COMMERCE_LEGAL_COPY[locale]
  const withdrawal = WITHDRAWAL_COPY[locale]
  const termsText = order.terms_snapshot ?? contractDocumentText(commerceSections('terms', locale, legal.termsText))
  const licenceText = order.licence_snapshot ?? contractDocumentText(commerceSections('license', locale))
  const text = contractEmailText([
    'NEUROKLAST AUDIO | ' + translations.docs.purchase,
    'Contract terms version: ' + (order.terms_version ?? session.metadata?.terms_version ?? COMMERCE_TERMS_VERSION),
    '',
    'Order reference: ' + order.id,
    'Date: ' + new Date().toISOString(),
    'Product: ' + product.title,
    'Description: ' + (product.short_description || product.title),
    'System requirements: ' + (Array.isArray(product.system_requirements) ? product.system_requirements.join('; ') : 'See product page'),
    'Payment provider: Stripe',
    'Total charged including applicable tax: ' + formatChargedAmount(session.amount_total, session.currency, locale),
    'Digital delivery. No physical shipment.',
    'Your software licence is assigned to your account after payment confirmation.',
    'Account: ' + siteUrl + '/neurokore/account',
    'Product: ' + siteUrl + '/plugins/' + product.slug,
    '',
    translations.sections.seller[0] + ':',
    operator || siteUrl + localizedLegalPath(locale, 'legal-notice'),
    'Email: ' + (legal.email || siteUrl + '/legal-notice'),
    '',
    translations.docs.withdrawal,
    withdrawal.period,
    withdrawal.refunds,
    withdrawal.exception,
    'Online withdrawal: ' + siteUrl + '/withdrawal',
    'Withdrawal information: ' + siteUrl + localizedLegalPath(locale, 'withdrawal-policy'),
    '',
    translations.docs.terms,
    termsText,
    '',
    translations.docs.license,
    licenceText,
    '',
    siteUrl + localizedLegalPath(locale, 'purchase-info'),
    siteUrl + localizedLegalPath(locale, 'privacy-policy'),
    siteUrl + '/legal-notice',
  ])
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + resendKey,
      // Stripe may retry a webhook. Resend must not send duplicate confirmations.
      'Idempotency-Key': 'plugin-contract-' + order.id,
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || 'NEUROKLAST <noreply@neuroklast.net>',
      to: [order.email],
      subject: translations.docs.purchase + ' – ' + product.title,
      text,
      html: contractEmailHtml({
        title: translations.docs.purchase,
        product: product.title,
        chargedAmount: formatChargedAmount(session.amount_total, session.currency, locale),
        accountUrl: siteUrl + '/neurokore/account',
        documentText: text,
      }),
    }),
  })
  if (!response.ok) throw new Error('Contract confirmation email unavailable')
}

