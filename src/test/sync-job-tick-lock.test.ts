import { beforeEach, describe, expect, it, vi } from 'vitest'

const hoisted = vi.hoisted(() => {
  const state = {
    afterCalls: 0,
    afterImpl: async (_cb: () => Promise<void>) => {},
    advanceSyncJob: vi.fn(),
    chainSyncJobTick: vi.fn(),
    isAdminSession: vi.fn(async () => true),
    isCronOrAdminAuthorized: vi.fn(() => true),
    revalidatePath: vi.fn(),
  }
  state.afterImpl = async (cb) => {
    state.afterCalls += 1
    await cb()
  }
  return state
})

vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>()
  return {
    ...actual,
    after: (cb: () => Promise<void>) => hoisted.afterImpl(cb),
  }
})

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => hoisted.revalidatePath(...args),
}))

vi.mock('@/lib/sync-job-runner', () => ({
  advanceSyncJob: (...args: unknown[]) => hoisted.advanceSyncJob(...args),
}))

vi.mock('@/lib/sync-job-chain', () => ({
  chainSyncJobTick: (...args: unknown[]) => hoisted.chainSyncJobTick(...args),
  isCronOrAdminAuthorized: (...args: unknown[]) => hoisted.isCronOrAdminAuthorized(...args),
}))

vi.mock('@/lib/api-admin-auth', () => ({
  isAdminSession: () => hoisted.isAdminSession(),
}))

import { POST } from '@/app/api/sync-jobs/[id]/tick/route'
import { continueSyncJob } from '@/lib/sync-job-continuation'

const job = { id: 'job-1', status: 'running' }

function tickRequest() {
  return POST(new Request('http://local.test/api/sync-jobs/job-1/tick', { method: 'POST' }), {
    params: Promise.resolve({ id: 'job-1' }),
  })
}

describe('sync tick lock', () => {
  beforeEach(() => {
    hoisted.afterCalls = 0
    hoisted.advanceSyncJob.mockReset()
    hoisted.chainSyncJobTick.mockReset()
    hoisted.isAdminSession.mockResolvedValue(true)
    hoisted.isCronOrAdminAuthorized.mockReturnValue(true)
  })

  it('does not schedule another tick when the lock is missed', async () => {
    hoisted.advanceSyncJob.mockResolvedValue({ job, done: false, busy: true })
    const res = await tickRequest()
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ job, done: false })
    expect(hoisted.afterCalls).toBe(0)
    expect(hoisted.chainSyncJobTick).not.toHaveBeenCalled()

    continueSyncJob('job-1')
    await vi.waitFor(() => expect(hoisted.advanceSyncJob).toHaveBeenCalledTimes(2))
    expect(hoisted.afterCalls).toBe(1)
    expect(hoisted.chainSyncJobTick).not.toHaveBeenCalled()
  })

  it('rejects an unauthorized tick', async () => {
    hoisted.isCronOrAdminAuthorized.mockReturnValue(false)
    const res = await tickRequest()
    expect(res.status).toBe(401)
    expect(hoisted.advanceSyncJob).not.toHaveBeenCalled()
  })
})
