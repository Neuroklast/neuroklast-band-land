'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/app/admin/_actions/auth'
import { getAdminUserId } from '@/lib/api-admin-auth'
import { createActionClient } from '@/lib/supabaseServer'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { MCP_PROVIDER_IDS, type McpProviderId } from '@/lib/mcp/client-registry'

export type McpClientChange = { success: true } | { success: false; error: string }

async function mfaAdminUser(): Promise<string> {
  await requireAdmin()
  const session = await createActionClient()
  const { data, error } = await session.auth.mfa.getAuthenticatorAssuranceLevel()
  if (error || data?.currentLevel !== 'aal2') throw new Error('Verify your admin authenticator first')
  const userId = await getAdminUserId()
  if (!userId) throw new Error('Administrator authentication required')
  return userId
}

const clientIdRegex = /^[A-Za-z0-9._:-]{8,180}$/

export async function registerMcpClient(formData: FormData): Promise<McpClientChange> {
  try {
    const userId = await mfaAdminUser()
    const clientId = String(formData.get('client_id') ?? '').trim()
    const displayName = String(formData.get('display_name') ?? '').trim()
    const provider = String(formData.get('provider') ?? '')
    if (!clientIdRegex.test(clientId) || displayName.length < 2 || displayName.length > 80 ||
        !MCP_PROVIDER_IDS.includes(provider as McpProviderId)) {
      return { success: false, error: 'Check client ID, provider and display name' }
    }
    // Only client IDs already registered with Supabase OAuth should be added.
    // This allowlist alone does NOT create OAuth credentials or redirect URIs.
    const admin = createAdminClient()
    const { error } = await admin.from('mcp_oauth_clients').insert({
      client_id: clientId, display_name: displayName, provider,
      enabled: true, created_by: userId, updated_by: userId,
    })
    if (error) return { success: false, error: 'Could not register the client; it may already exist' }
    revalidatePath('/admin/integrations')
    return { success: true }
  } catch {
    return { success: false, error: 'Current admin session must have verified MFA (AAL2)' }
  }
}

export async function setMcpClientEnabled(clientId: string, enabled: boolean): Promise<McpClientChange> {
  try {
    const userId = await mfaAdminUser()
    if (!clientIdRegex.test(clientId) || typeof enabled !== 'boolean') {
      return { success: false, error: 'Invalid client update' }
    }
    const admin = createAdminClient()
    const { data, error } = await admin.from('mcp_oauth_clients')
      .update({ enabled, updated_by: userId, updated_at: new Date().toISOString() })
      .eq('client_id', clientId).eq('enabled', !enabled)
      .select('client_id').maybeSingle()
    if (error || !data) return { success: false, error: 'Client state was not changed' }
    revalidatePath('/admin/integrations')
    return { success: true }
  } catch {
    return { success: false, error: 'Current admin session must have verified MFA (AAL2)' }
  }
}
