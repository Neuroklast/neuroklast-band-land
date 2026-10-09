import { afterEach, describe, expect, it, vi } from 'vitest'

const deploy = vi.hoisted(() => ({
  order: [] as string[],
  claimWins: true,
}))

vi.mock('@/lib/supabaseAdmin', () => ({
  createAdminClient: () => ({
    rpc: async () => {
      deploy.order.push('claim')
      return { data: deploy.claimWins, error: null }
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { value: { sha: 'old', status: 'ok' } },
            error: null,
          }),
        }),
      }),
      upsert: async () => {
        deploy.order.push('upsert')
        return { error: null }
      },
    }),
  }),
}))

vi.mock('@/lib/r2-inventory', () => ({
  listAllR2ObjectKeys: async () => {
    deploy.order.push('list')
    return ['covers/a.jpg']
  },
}))

vi.mock('@/lib/r2-reconcile', () => ({
  applyR2MediaReconcile: async () => {
    deploy.order.push('reconcile')
    return { objectCount: 1, rewrittenRows: 0, replacements: 0 }
  },
}))

import { runProductionDeployR2Reconcile, shouldRunR2DeployReconcile } from '@/lib/r2-reconcile-on-deploy'

describe('shouldRunR2DeployReconcile', () => {
  it('skips preview, local, and missing sha', () => {
    expect(
      shouldRunR2DeployReconcile({ vercelEnv: 'preview', commitSha: 'abc', last: null }).run,
    ).toBe(false)
    expect(
      shouldRunR2DeployReconcile({ vercelEnv: undefined, commitSha: 'abc', last: null }).run,
    ).toBe(false)
    expect(
      shouldRunR2DeployReconcile({ vercelEnv: 'production', commitSha: '', last: null }).run,
    ).toBe(false)
  })

  it('runs once per production sha and skips when already ok', () => {
    expect(
      shouldRunR2DeployReconcile({ vercelEnv: 'production', commitSha: 'abc', last: null }).run,
    ).toBe(true)
    expect(
      shouldRunR2DeployReconcile({
        vercelEnv: 'production',
        commitSha: 'abc',
        last: { sha: 'abc', status: 'ok' },
      }).run,
    ).toBe(false)
    expect(
      shouldRunR2DeployReconcile({
        vercelEnv: 'production',
        commitSha: 'def',
        last: { sha: 'abc', status: 'ok' },
      }).run,
    ).toBe(true)
  })

  it('skips a fresh in-progress run but retries after stale or error', () => {
    const now = Date.parse('2026-08-30T12:00:00.000Z')
    expect(
      shouldRunR2DeployReconcile({
        vercelEnv: 'production',
        commitSha: 'abc',
        last: { sha: 'abc', status: 'running', startedAt: '2026-08-30T11:55:00.000Z' },
        nowMs: now,
      }).run,
    ).toBe(false)
    expect(
      shouldRunR2DeployReconcile({
        vercelEnv: 'production',
        commitSha: 'abc',
        last: { sha: 'abc', status: 'running', startedAt: '2026-08-30T11:00:00.000Z' },
        nowMs: now,
      }).run,
    ).toBe(true)
    expect(
      shouldRunR2DeployReconcile({
        vercelEnv: 'production',
        commitSha: 'abc',
        last: { sha: 'abc', status: 'error', error: 'R2 timeout' },
      }).run,
    ).toBe(true)
  })
})

describe('runProductionDeployR2Reconcile', () => {
  const envKeys = [
    'VERCEL_ENV',
    'VERCEL_GIT_COMMIT_SHA',
    'R2_PUBLIC_HOST',
    'R2_BUCKET_MEDIA',
    'R2_ACCOUNT_ID',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ] as const
  const previous = new Map<string, string | undefined>()

  afterEach(() => {
    for (const key of envKeys) {
      const value = previous.get(key)
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  })

  function armEnv() {
    for (const key of envKeys) previous.set(key, process.env[key])
    process.env.VERCEL_ENV = 'production'
    process.env.VERCEL_GIT_COMMIT_SHA = 'new-sha'
    process.env.R2_PUBLIC_HOST = 'media.example.com'
    process.env.R2_BUCKET_MEDIA = 'media'
    process.env.R2_ACCOUNT_ID = 'account'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role'
    deploy.order = []
  }

  it('claims site_config before listing the bucket', async () => {
    armEnv()
    deploy.claimWins = true
    await runProductionDeployR2Reconcile()
    expect(deploy.order.indexOf('claim')).toBeGreaterThanOrEqual(0)
    expect(deploy.order.indexOf('claim')).toBeLessThan(deploy.order.indexOf('list'))
  })

  it('does not list the bucket when the claim is lost', async () => {
    armEnv()
    deploy.claimWins = false
    await runProductionDeployR2Reconcile()
    expect(deploy.order).toEqual(['claim'])
  })
})
