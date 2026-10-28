'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/app/admin/_actions/auth'
import { getAdminUserId } from '@/lib/api-admin-auth'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { createActionClient } from '@/lib/supabaseServer'
import { allowedContentFields, digestContent, getContentDefinition, parseContentChanges } from '@/lib/mcp/content'
import { z } from 'zod'
import { mergeSiteContent, parseSiteContentPatch } from '@/lib/mcp/site-config'

const uuid = z.string().uuid()

export async function reviewMcpContent(requestId: string, decision: 'approve' | 'reject'): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin()
    // Content publishing requires a fresh MFA-assured admin session, too.
    const session = await createActionClient()
    const { data: assurance, error: assuranceError } = await session.auth.mfa.getAuthenticatorAssuranceLevel()
    if (assuranceError || assurance?.currentLevel !== 'aal2') return { error: 'MFA (AAL2) is required to approve editorial changes' }
    const reviewer = await getAdminUserId()
    if (!reviewer || !uuid.safeParse(requestId).success || !['approve', 'reject'].includes(decision)) {
      return { error: 'Review request invalid' }
    }
    const admin = createAdminClient()
    const now = new Date().toISOString()

    if (decision === 'reject') {
      const { data, error } = await admin.from('mcp_content_requests')
        .update({ status: 'rejected', reviewed_at: now, reviewed_by: reviewer })
        .eq('id', requestId).eq('status', 'pending').select('id').maybeSingle()
      if (error || !data) return { error: 'Request is no longer pending' }
      revalidatePath('/admin/ai-content')
      return { success: true }
    }

    // Atomic claim prevents duplicate approval from two concurrent admin sessions.
    const { data: request, error: claimError } = await admin.from('mcp_content_requests')
      .update({ status: 'applying', reviewed_at: now, reviewed_by: reviewer })
      .eq('id', requestId).eq('status', 'pending')
      .select('id, collection, operation, target_id, target_key, changes, previous_hash').maybeSingle()
    if (claimError || !request) return { error: 'Request is no longer pending' }

    try {
      if (request.operation === 'config' && request.collection === 'site_config') {
        const key = String(request.target_key ?? '')
        const patch = parseSiteContentPatch(key, request.changes)
        const { data: current, error: readError } = await admin.from('site_config')
          .select('value').eq('key', key).maybeSingle()
        if (readError || digestContent({ value: current?.value ?? null }) !== request.previous_hash) {
          await admin.from('mcp_content_requests')
            .update({ status: 'conflict', error: 'Site text changed after the proposal was submitted' })
            .eq('id', requestId).eq('status', 'applying')
          revalidatePath('/admin/ai-content')
          return { error: 'Conflict: live site text has changed. Submit a fresh proposal.' }
        }
        const next = mergeSiteContent(key, current?.value, patch)
        const { error: saveError } = await admin.from('site_config').upsert({
          key, value: next, updated_at: new Date().toISOString(),
        }, { onConflict: 'key' })
        if (saveError) throw new Error('Unable to apply site text')
      } else {
      const definition = getContentDefinition(request.collection)
      if (!definition || !['create', 'update'].includes(request.operation)) throw new Error('Unsupported collection')
      const operation = request.operation as 'create' | 'update'
      const changes = parseContentChanges(request.collection, operation, request.changes)
      if (operation === 'update') {
        if (!uuid.safeParse(request.target_id).success) throw new Error('Invalid target')
        const fields = ['id', ...allowedContentFields(request.collection)].join(',')
        const { data: current, error } = await admin.from(request.collection)
          .select(fields).eq('id', request.target_id).maybeSingle()
        if (error || !current || digestContent(current) !== request.previous_hash) {
          await admin.from('mcp_content_requests')
            .update({ status: 'conflict', error: 'Content changed after the proposal was submitted' })
            .eq('id', requestId).eq('status', 'applying')
          revalidatePath('/admin/ai-content')
          return { error: 'Conflict: live content has changed. A new proposal is required.' }
        }
        const patch = request.collection === 'releases'
          ? { ...changes, manually_edited: true }
          : changes
        const { data: updated, error: updateError } = await admin.from(request.collection)
          .update(patch).eq('id', request.target_id).select('id').maybeSingle()
        if (updateError || !updated) throw new Error('Content update failed')
      } else {
        const { data: created, error } = await admin.from(request.collection)
          .insert(changes).select('id').single()
        if (error || !created) throw new Error('Content creation failed')
      }
      }
      const { error: auditError } = await admin.from('mcp_content_requests')
        .update({ status: 'approved' }).eq('id', requestId).eq('status', 'applying')
      if (auditError) throw new Error('Audit status update failed')
      // Invalidate the same cached public content as native admin mutations.
      revalidatePath('/', 'layout')
      for (const path of ['/admin/ai-content', '/news', '/gigs', '/releases', '/media', '/soundpacks', '/products']) {
        revalidatePath(path)
      }
      return { success: true }
    } catch {
      await admin.from('mcp_content_requests')
        .update({ status: 'failed', error: 'Review processing failed. Inspect server logs.' })
        .eq('id', requestId).eq('status', 'applying')
      revalidatePath('/admin/ai-content')
      return { error: 'Unable to apply content change. No retry will occur automatically.' }
    }
  } catch {
    return { error: 'Administrator authentication or review service unavailable' }
  }
}
