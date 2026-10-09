import { afterEach, describe, expect, it, vi } from 'vitest'

const deploy = vi.hoisted(() => ({
  order: [] as string[],
  claimWins: true,
}))

vi.mock('@/lib/supabaseAdmin', () => ({
  createAdminClient: () => ({
    rpc: async (name: string, args: { p_previous?: unknown }) => {
      deploy.order.push('claim')
      if (name !== 'claim_site_config_run') {
        return { data: null, error: { message: 'missing function' } }
      }
      if (args.p_previous !== null && typeof args.p_previous !== 'object') {
        return { data: null, error: { message: 'previous was not JSON' } }
      }
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

vi.mock('postgres', () => ({
  default: () => ({
    unsafe: async () => {
      deploy.order.push('apply')
    },
    end: async () => {},
  }),
}))

import {
  claimSiteConfigRun,
  isMissingSiteConfigTable,
  runProductionDeploySchemaApply,
  shouldRunSchemaApply,
} from '@/lib/schema-apply-on-deploy'

describe('shouldRunSchemaApply', () => {
  it('skips non-production', () => {
    const result = shouldRunSchemaApply({
      vercelEnv: 'preview',
      commitSha: 'abc',
      last: null,
    })
    expect(result.run).toBe(false)
  })

  it('runs once per production SHA', () => {
    const result = shouldRunSchemaApply({
      vercelEnv: 'production',
      commitSha: 'abc123',
      last: null,
    })
    expect(result.run).toBe(true)
  })

  it('skips when SHA already succeeded', () => {
    const result = shouldRunSchemaApply({
      vercelEnv: 'production',
      commitSha: 'abc123',
      last: { sha: 'abc123', status: 'ok' },
    })
    expect(result.run).toBe(false)
  })
})

describe('isMissingSiteConfigTable', () => {
  it('treats a schema-cache miss as a fresh database', () => {
    expect(
      isMissingSiteConfigTable(
        "Could not find the table 'public.site_config' in the schema cache",
      ),
    ).toBe(true)
    expect(isMissingSiteConfigTable('connection refused')).toBe(false)
  })
})

describe('claimSiteConfigRun', () => {
  it('sends the previous JSON object to the claim RPC', async () => {
    const previous = { sha: 'old', status: 'ok' }
    const calls: Array<{ p_previous?: unknown }> = []
    const supabase = {
      rpc: async (_name: string, args: { p_previous?: unknown }) => {
        calls.push(args)
        return { data: false, error: null }
      },
    }
    const claimed = await claimSiteConfigRun(
      supabase as never,
      'schema_apply_deploy',
      previous,
      { sha: 'new', status: 'running' },
    )
    expect(claimed).toBe(false)
    expect(calls[0]?.p_previous).toEqual(previous)
    expect(calls[0]?.p_previous).not.toBe('[object Object]')
  })
})

describe('runProductionDeploySchemaApply', () => {
  const envKeys = [
    'VERCEL_ENV',
    'VERCEL_GIT_COMMIT_SHA',
    'SUPABASE_DB_URL',
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
    process.env.SUPABASE_DB_URL = 'postgres://example'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role'
    deploy.order = []
  }

  it('claims site_config before applying schema', async () => {
    armEnv()
    deploy.claimWins = true
    await runProductionDeploySchemaApply()
    expect(deploy.order.indexOf('claim')).toBeGreaterThanOrEqual(0)
    expect(deploy.order.indexOf('claim')).toBeLessThan(deploy.order.indexOf('apply'))
  })

  it('does not apply schema when the claim is lost', async () => {
    armEnv()
    deploy.claimWins = false
    await runProductionDeploySchemaApply()
    expect(deploy.order).toEqual(['claim'])
  })
})
