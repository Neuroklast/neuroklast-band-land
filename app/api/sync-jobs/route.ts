import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminUserId, isAdminSession } from '@/lib/api-admin-auth'
import { continueSyncJob } from '@/lib/sync-job-continuation'
import {
  createSyncJob,
  updateSyncJob,
  type SyncJobPayload,
} from '@/lib/sync-jobs'
import { SYNC_JOB_TYPES, initialSyncJobPayload, initialSyncJobPhase } from '@/lib/sync-job-types'

export const dynamic = 'force-dynamic'

const createJobSchema = z.object({
  type: z.enum(SYNC_JOB_TYPES),
  payload: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(request: Request) {
  const admin = await isAdminSession()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = createJobSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  }

  try {
    const userId = await getAdminUserId()
    const type = parsed.data.type
    const payload = {
      ...initialSyncJobPayload(type),
      ...(parsed.data.payload ?? {}),
    }

    const job = await createSyncJob(type, payload as SyncJobPayload, userId)
    const phase = initialSyncJobPhase(type)
    if (phase) {
      await updateSyncJob(job.id, { phase })
    }

    continueSyncJob(job.id)

    return NextResponse.json({ jobId: job.id, status: job.status }, { status: 201 })
  } catch (error) {
    console.error('[sync-jobs] create failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create sync job' },
      { status: 500 },
    )
  }
}