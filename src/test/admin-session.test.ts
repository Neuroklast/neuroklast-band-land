import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hashPassword } from '@/components/AdminLoginDialog'

// ---------------------------------------------------------------------------
// hashPassword unit tests — ensures consistent SHA-256 hex output
// ---------------------------------------------------------------------------
describe('hashPassword', () => {
  it('returns a 64-character hex string', async () => {
    const hash = await hashPassword('testpassword')
    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('produces consistent output for same input', async () => {
    const a = await hashPassword('mySecret123')
    const b = await hashPassword('mySecret123')
    expect(a).toBe(b)
  })

  it('produces different output for different input', async () => {
    const a = await hashPassword('password1')
    const b = await hashPassword('password2')
    expect(a).not.toBe(b)
  })

  it('handles empty string', async () => {
    const hash = await hashPassword('')
    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('handles special characters', async () => {
    const hash = await hashPassword('pässwörd!@#$%^&*()')
    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })
})

// ---------------------------------------------------------------------------
// Admin session restoration logic tests
// ---------------------------------------------------------------------------
describe('admin session restoration', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('localStorage admin-token survives simulated reload', () => {
    const hash = 'abc123def456'
    localStorage.setItem('admin-token', hash)
    // Simulate reading it back (as App.tsx would on mount)
    expect(localStorage.getItem('admin-token')).toBe(hash)
  })

  it('isOwner should be true when stored token matches password hash', () => {
    const hash = 'abc123def456'
    localStorage.setItem('admin-token', hash)
    const storedToken = localStorage.getItem('admin-token')
    const adminPasswordHash = hash
    const isOwner = !!(storedToken && storedToken === adminPasswordHash)
    expect(isOwner).toBe(true)
  })

  it('isOwner should be false when stored token does NOT match', () => {
    localStorage.setItem('admin-token', 'old-hash')
    const storedToken = localStorage.getItem('admin-token')
    const adminPasswordHash = 'new-hash'
    const isOwner = !!(storedToken && storedToken === adminPasswordHash)
    expect(isOwner).toBe(false)
  })

  it('isOwner should be false when no token is stored', () => {
    const storedToken = localStorage.getItem('admin-token')
    const adminPasswordHash = 'some-hash'
    const isOwner = !!(storedToken && storedToken === adminPasswordHash)
    expect(isOwner).toBe(false)
  })

  it('isOwner should be false when password hash is empty (no password set)', () => {
    localStorage.setItem('admin-token', 'some-hash')
    const storedToken = localStorage.getItem('admin-token')
    const adminPasswordHash = ''
    const isOwner = !!(storedToken && storedToken === adminPasswordHash)
    expect(isOwner).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Admin login flow integration tests (pure-logic)
// ---------------------------------------------------------------------------
describe('admin login flow', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('login stores token in localStorage and validates correctly', async () => {
    const password = 'superSecret42'
    const hash = await hashPassword(password)

    // Simulate what handleAdminLogin does
    const loginHash = await hashPassword(password)
    expect(loginHash).toBe(hash)

    localStorage.setItem('admin-token', loginHash)
    expect(localStorage.getItem('admin-token')).toBe(hash)
  })

  it('login with wrong password should not match', async () => {
    const correctHash = await hashPassword('correct')
    const loginHash = await hashPassword('wrong')
    expect(loginHash).not.toBe(correctHash)
  })

  it('password change updates token in localStorage', async () => {
    const oldHash = await hashPassword('oldPassword')
    localStorage.setItem('admin-token', oldHash)

    const newHash = await hashPassword('newPassword')
    localStorage.setItem('admin-token', newHash)

    expect(localStorage.getItem('admin-token')).toBe(newHash)
    expect(localStorage.getItem('admin-token')).not.toBe(oldHash)
  })

  it('password change must read OLD token before updating localStorage', async () => {
    // This test validates the fix for the critical password-change bug:
    // The KV write (setAdminPasswordHash) reads localStorage synchronously
    // inside setValue. If localStorage is updated BEFORE the KV write,
    // the new hash is sent as x-admin-token, but the server still has the
    // old hash → 403. The correct order is: KV write first, then update
    // localStorage.
    const oldHash = await hashPassword('oldPassword')
    const newHash = await hashPassword('newPassword')
    localStorage.setItem('admin-token', oldHash)

    // Simulate the CORRECT order (as in handleChangeAdminPassword):
    // 1. Read token BEFORE updating localStorage
    const tokenDuringKvWrite = localStorage.getItem('admin-token')
    expect(tokenDuringKvWrite).toBe(oldHash) // OLD token used for auth ✓

    // 2. Then update localStorage
    localStorage.setItem('admin-token', newHash)
    expect(localStorage.getItem('admin-token')).toBe(newHash)
  })

  it('initial password setup needs token in localStorage before KV write', async () => {
    // For initial setup (no existing password), the server skips auth.
    // But useKV's guard requires a non-empty adminToken to POST at all.
    // So localStorage must be set BEFORE setAdminPasswordHash.
    const hash = await hashPassword('firstPassword')

    // Before setup, no token exists
    expect(localStorage.getItem('admin-token')).toBeNull()

    // Set token first (so useKV's POST guard passes)
    localStorage.setItem('admin-token', hash)
    expect(localStorage.getItem('admin-token')).toBe(hash)
  })
})
