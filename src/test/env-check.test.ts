/**
 * Tests for the env-check utility module.
 *
 * Pure logic tests — no DOM or network required.
 */
import { describe, it, expect } from 'vitest'
import { REQUIRED_ENV_VARS, allRequiredSet, type EnvStatus } from '@/lib/env-check'

// ─── REQUIRED_ENV_VARS metadata ──────────────────────────────────────────────

describe('REQUIRED_ENV_VARS', () => {
  it('contains the four expected variables', () => {
    const keys = REQUIRED_ENV_VARS.map((v) => v.key)
    expect(keys).toContain('KV_REST_API_URL')
    expect(keys).toContain('KV_REST_API_TOKEN')
    expect(keys).toContain('ADMIN_SETUP_TOKEN')
    expect(keys).toContain('RESEND_API_KEY')
  })

  it('marks KV and ADMIN vars as required', () => {
    const required = REQUIRED_ENV_VARS.filter((v) => v.required).map((v) => v.key)
    expect(required).toContain('KV_REST_API_URL')
    expect(required).toContain('KV_REST_API_TOKEN')
    expect(required).toContain('ADMIN_SETUP_TOKEN')
  })

  it('marks RESEND_API_KEY as optional', () => {
    const resend = REQUIRED_ENV_VARS.find((v) => v.key === 'RESEND_API_KEY')
    expect(resend?.required).toBe(false)
  })

  it('every entry has a non-empty label and description', () => {
    for (const v of REQUIRED_ENV_VARS) {
      expect(v.label.length).toBeGreaterThan(0)
      expect(v.description.length).toBeGreaterThan(0)
    }
  })
})

// ─── allRequiredSet ──────────────────────────────────────────────────────────

describe('allRequiredSet', () => {
  it('returns true when all required vars are set', () => {
    const status: EnvStatus = {
      KV_REST_API_URL: true,
      KV_REST_API_TOKEN: true,
      ADMIN_SETUP_TOKEN: true,
      RESEND_API_KEY: false,
    }
    expect(allRequiredSet(status)).toBe(true)
  })

  it('returns true when all vars including optional are set', () => {
    const status: EnvStatus = {
      KV_REST_API_URL: true,
      KV_REST_API_TOKEN: true,
      ADMIN_SETUP_TOKEN: true,
      RESEND_API_KEY: true,
    }
    expect(allRequiredSet(status)).toBe(true)
  })

  it('returns false when a required var is missing', () => {
    const status: EnvStatus = {
      KV_REST_API_URL: true,
      KV_REST_API_TOKEN: false,
      ADMIN_SETUP_TOKEN: true,
      RESEND_API_KEY: false,
    }
    expect(allRequiredSet(status)).toBe(false)
  })

  it('returns false when all required vars are missing', () => {
    const status: EnvStatus = {
      KV_REST_API_URL: false,
      KV_REST_API_TOKEN: false,
      ADMIN_SETUP_TOKEN: false,
      RESEND_API_KEY: false,
    }
    expect(allRequiredSet(status)).toBe(false)
  })

  it('does not require optional RESEND_API_KEY', () => {
    const status: EnvStatus = {
      KV_REST_API_URL: true,
      KV_REST_API_TOKEN: true,
      ADMIN_SETUP_TOKEN: true,
      RESEND_API_KEY: false,
    }
    expect(allRequiredSet(status)).toBe(true)
  })
})
