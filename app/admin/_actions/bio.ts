'use server'

import { runAdminAction } from '@/app/admin/_actions/auth'
import { createSupabaseActionContext } from '@/app/admin/_actions/context'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { dispatchAdminActionAsAdmin } from '@/app/admin/_actions/context'
import { revalidatePath } from 'next/cache'

function parseStringListField(formData: FormData, name: string): string[] {
  const raw = formData.get(name)
  if (typeof raw !== 'string' || raw.trim() === '') return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
    }
  } catch {
    // fall through — treat as a single line
  }
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export async function updateBio(formData: FormData) {
  const content = formData.get('content')
  if (typeof content !== 'string') return { error: 'Invalid content' }

  const achievements = parseStringListField(formData, 'achievements')
  const collabs = parseStringListField(formData, 'collabs')

  const supabaseAdmin = createAdminClient()

  const dispatchResult = dispatchAdminActionAsAdmin(
    'update_bio',
    { content, achievements, collabs },
    createSupabaseActionContext(supabaseAdmin),
  )
  if (!dispatchResult.ok) return { error: dispatchResult.error }

  return runAdminAction(async () => {
    const { data: existing } = await supabaseAdmin
      .from('bio')
      .select('id')
      .limit(1)
      .maybeSingle()

    let error
    if (existing) {
      ;({ error } = await supabaseAdmin
        .from('bio')
        .update({ content, achievements, collabs, updated_at: new Date().toISOString() })
        .eq('id', existing.id))
    } else {
      ;({ error } = await supabaseAdmin.from('bio').insert({ content, achievements, collabs }))
    }

    if (error) return { error: error.message }
    revalidatePath('/admin/bio')
    revalidatePath('/')
    return { success: true }
  }, 'Unable to save biography content.')
}
