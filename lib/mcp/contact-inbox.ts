import { createAdminClient } from '@/lib/supabaseAdmin'
import { postgresUuid } from '@/lib/mcp/postgres-uuid'
import { McpAccessError } from '@/lib/mcp/server'

/**
 * Private support enquiries. ONLY call these functions after authenticateMcp(),
 * which verifies an allowlisted OAuth client, current admin role and MFA grant.
 * Never put these records in the public editorial content registry.
 */
export type ContactInboxStatus = 'open' | 'closed' | 'all'

type ContactInboxRow = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  delivery_state: string
  created_at: string
  closed_at: string | null
}

const contactFields = 'id,name,email,subject,message,delivery_state,created_at,closed_at'
const inboxUrl = 'https://neuroklast.net/admin/contact-inbox'

export async function listContactInbox(
  status: ContactInboxStatus = 'open',
  limit = 20,
  offset = 0,
) {
  if (!['open', 'closed', 'all'].includes(status)) throw new McpAccessError('Invalid contact inbox status', 400)
  if (!Number.isInteger(limit) || limit < 1 || limit > 30 ||
      !Number.isInteger(offset) || offset < 0 || offset > 2000) {
    throw new McpAccessError('Invalid contact inbox pagination', 400)
  }

  const admin = createAdminClient()
  let query = admin.from('plugin_contact_requests').select(contactFields)
  if (status === 'open') query = query.is('closed_at', null)
  if (status === 'closed') query = query.not('closed_at', 'is', null)
  const { data, error } = await query.order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  if (error || !data) throw new Error('Contact inbox listing unavailable')

  // Small snippets for triage. Full message bodies require a separate get by UUID.
  return {
    items: data.map((item: ContactInboxRow) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      subject: item.subject,
      preview: item.message.slice(0, 180),
      delivery_state: item.delivery_state,
      created_at: item.created_at,
      closed_at: item.closed_at,
    })),
    status,
    next_offset: data.length === limit ? offset + limit : null,
    review_url: inboxUrl,
  }
}

export async function getContactInboxMessage(id: string) {
  if (!postgresUuid.safeParse(id).success) throw new McpAccessError('Invalid contact message id', 400)
  const admin = createAdminClient()
  const { data, error } = await admin.from('plugin_contact_requests')
    .select(contactFields).eq('id', id).maybeSingle()
  if (error) throw new Error('Contact inbox lookup unavailable')
  if (!data) throw new McpAccessError('Contact message not found', 404)
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    subject: data.subject,
    message: data.message,
    delivery_state: data.delivery_state,
    created_at: data.created_at,
    closed_at: data.closed_at,
    review_url: inboxUrl,
  }
}
