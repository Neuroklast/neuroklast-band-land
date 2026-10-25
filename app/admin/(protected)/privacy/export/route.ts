import { z } from 'zod'
import { admin, db, limit, sameOrigin } from '@/lib/neurokore/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const requestSchema = z.object({
  email: z.email().max(254).transform(value => value.trim().toLowerCase()),
  identity_verified: z.literal('yes'),
})

/**
 * Export only fields of the verified data subject. Never include encrypted
 * licence keys, hashes used for authentication, API secrets or sessions.
 * External processors and unlinked analytics require separate review.
 */
export async function POST(request: Request) {
  let actor: string
  try {
    sameOrigin(request)
    await limit(request, 'privacy-export', 5)
    actor = await admin()
  } catch {
    return Response.json({ error: 'Administrator authentication and MFA required.' }, { status: 403 })
  }

  const parsed = requestSchema.safeParse(Object.fromEntries(await request.formData().catch(() => new FormData())))
  if (!parsed.success) {
    return Response.json({ error: 'Verified identity and a valid email address are required.' }, { status: 400 })
  }

  const { email } = parsed.data
  const client = db()
  const PAGE_SIZE = 500

  async function records(table: 'plugin_orders' | 'plugin_licenses' | 'plugin_withdrawal_notices',
    fields: string, dateColumn: string) {
    const rows: Record<string, unknown>[] = []
    for (let page = 0; page < 40; page++) {
      const { data, error } = await client.from(table)
        .select(fields)
        .eq('email', email)
        .order(dateColumn, { ascending: true })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
      if (error) throw new Error('Data source unavailable: ' + table)
      rows.push(...((data ?? []) as unknown as Record<string, unknown>[]))
      if ((data ?? []).length < PAGE_SIZE) return rows
    }
    throw new Error('Data source exceeds safe export limit: ' + table)
  }

  try {
    const [orders, licenses, withdrawals] = await Promise.all([
      records('plugin_orders',
        'id,product_id,user_id,email,price_id,stripe_session,payment_intent,license_id,confirmation_sent_at,created_at',
        'created_at'),
      records('plugin_licenses',
        'id,product_id,email,tier,license_format,max_devices,expires_at,revoked_at,stripe_session,created_at,plugin_devices(device,activated_at)',
        'created_at'),
      records('plugin_withdrawal_notices',
        'id,name,email,contract_details,locale,received_at,customer_receipt_at,provider_notice_at',
        'received_at'),
    ])

    // Supabase Auth's admin API has no reliable equality filter for email.
    // Paginate with a hard bound and flag incomplete account discovery.
    const authUsers: Array<{ id: string; email?: string; created_at: string; email_confirmed_at?: string | null; last_sign_in_at?: string | null }> = []
    let authScanComplete = false
    for (let page = 1; page <= 20; page++) {
      const { data, error } = await client.auth.admin.listUsers({ page, perPage: 500 })
      if (error || !data) throw new Error('Authentication source unavailable.')
      for (const user of data.users) {
        if (user.email?.toLowerCase() === email) {
          authUsers.push({
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            email_confirmed_at: user.email_confirmed_at,
            last_sign_in_at: user.last_sign_in_at,
          })
        }
      }
      if (data.users.length < 500) { authScanComplete = true; break }
    }
    const userIds = [...new Set(authUsers.map(user => user.id))]
    const profiles = userIds.length > 0
      ? await client.from('profiles').select('id,role').in('id', userIds)
      : { data: [], error: null }
    if (profiles.error) throw new Error('Profile source unavailable.')

    const { data: requestRecord, error: recordError } = await client.from('privacy_requests')
      .insert({
        email, request_type: 'access', status: 'exported',
        identity_verified_by: actor, exported_at: new Date().toISOString(),
      })
      .select('id,created_at')
      .single()
    if (recordError || !requestRecord) throw new Error('Privacy request log unavailable. Apply the canonical schema.')

    const body = JSON.stringify({
      export: {
        request_id: requestRecord.id,
        created_at: requestRecord.created_at,
        format: 'json',
        status: 'prepared_not_delivered',
        verified_by_administrator: true,
      },
      data_subject: { email },
      data: {
        accounts: authUsers,
        profiles: profiles.data ?? [],
        orders,
        licences_and_devices: licenses,
        withdrawal_notices: withdrawals,
      },
      processing_information: {
        purposes: [
          'Customer account and authentication',
          'Order fulfilment and contract records',
          'Software licensing, device activation and support',
          'Contract withdrawal requests',
        ],
        legal_bases: ['GDPR Art. 6(1)(b)', 'GDPR Art. 6(1)(c)', 'GDPR Art. 6(1)(f), where applicable'],
        recipients_to_review: ['Supabase', 'Vercel', 'Cloudflare R2', 'Stripe', 'Resend'],
        retention: 'Refer to the current privacy notice and statutory retention obligations. Verify provider retention individually.',
        source_of_data: 'Account information from the user, order and licence data from transactions and activations.',
        data_subject_rights: 'Access, rectification, erasure, restriction, portability where applicable, objection and complaint to a supervisory authority.',
      },
      manual_follow_up: [
        'Check Stripe for additional invoices, payment and refund data.',
        'Check Resend and the actual contact mailbox for messages from the requester.',
        'Check hosting/security logs at Vercel, Cloudflare and other active processors where identifiable.',
        'Anonymous analytics events cannot currently be reliably attributed to a person.',
        ...(!authScanComplete ? ['Account discovery exceeded 10,000 users: complete an additional Supabase Auth search.'] : []),
        'Review third-party rights and redactions before sending this report.',
        'Mark the request as answered only once a secure response has actually been delivered.',
      ],
    }, null, 2)

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': 'attachment; filename="neuroklast-gdpr-' + requestRecord.id + '.json"',
        'Cache-Control': 'private, no-store, max-age=0',
        'Pragma': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
      },
    })
  } catch {
    return Response.json({
      error: 'Export could not be completed. No partial data was released. Check the database schema and admin logs.',
    }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
