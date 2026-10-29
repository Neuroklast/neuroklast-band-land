import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { HeroConfigEditor } from '@/app/admin/(protected)/site-config/HeroConfigEditor'
import { updateSiteConfig } from '@/app/admin/_actions/siteConfig'
import { broadcastAdminDraft, broadcastAdminRefresh } from '@/lib/admin-draft-channel'
import { DEFAULT_HERO_LOGO_URL } from '@/lib/hero-defaults'

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))
vi.mock('@/app/admin/_actions/siteConfig', () => ({ updateSiteConfig: vi.fn() }))
vi.mock('@/lib/admin-draft-channel', () => ({
  broadcastAdminDraft: vi.fn(),
  broadcastAdminRefresh: vi.fn(),
}))
vi.mock('@/hooks/use-unsaved-changes', () => ({ useUnsavedChanges: vi.fn() }))
vi.mock('@/app/admin/(protected)/site-config/HeroWordmarkControls', () => ({
  HeroWordmarkControls: ({
    onLogoResolved, onResetLogo,
  }: {
    onLogoResolved: (path: string, url?: string) => void
    onResetLogo: () => void
  }) => (
    <div>
      <button type="button" onClick={() => onLogoResolved('hero/logo/new.png', 'https://cdn.example/logo.png')}>Update wordmark</button>
      <button type="button" onClick={onResetLogo}>Reset wordmark</button>
    </div>
  ),
}))
vi.mock('@/app/admin/(protected)/site-config/HeroBackgroundControls', () => ({
  HeroBackgroundControls: ({
    onBackgroundResolved, onBackgroundCleared,
  }: {
    onBackgroundResolved: (path: string, url?: string) => void
    onBackgroundCleared: () => void
  }) => (
    <div>
      <button type="button" onClick={() => onBackgroundResolved('hero/background/new.png', 'https://cdn.example/background.png')}>Update background</button>
      <button type="button" onClick={onBackgroundCleared}>Clear background</button>
    </div>
  ),
}))
vi.mock('@/app/admin/(protected)/site-config/HeroGlitchControls', () => ({
  HeroGlitchControls: () => <div>Glitch controls</div>,
}))
beforeEach(() => { vi.mocked(updateSiteConfig).mockResolvedValue({ success: true }) })
afterEach(() => { cleanup(); vi.clearAllMocks() })

describe('hero media editor integration', () => {
  it('separates default logo preview from null persisted logo', async () => {
    render(<HeroConfigEditor currentValue={{}} />)
    await waitFor(() => expect(broadcastAdminDraft).toHaveBeenCalled())
    expect(vi.mocked(broadcastAdminDraft).mock.lastCall?.[1]).toMatchObject({
      logoImageUrl: DEFAULT_HERO_LOGO_URL,
      logoImageStoragePath: null,
      backgroundImageUrl: null,
      backgroundImageOpacity: 0.35,
      logoWidthPercent: 55,
      logoWidthPercentMobile: 90,
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(updateSiteConfig).toHaveBeenCalledOnce())
    const fd = vi.mocked(updateSiteConfig).mock.calls[0][0]
    expect(fd.get('key')).toBe('hero')
    const saved = JSON.parse(String(fd.get('value')))
    expect(saved.logoImageUrl).toBeNull()
    expect(saved.backgroundImageUrl).toBeNull()
    expect(saved.logoWidthPercent).toBe(55)
    await waitFor(() => expect(broadcastAdminRefresh).toHaveBeenCalledOnce())
  })

  it('persists both media updates and clears without modifying other hero values', async () => {
    render(<HeroConfigEditor currentValue={{ tagline: 'Prior tagline' }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Update wordmark' }))
    fireEvent.click(screen.getByRole('button', { name: 'Update background' }))
    await waitFor(() => expect(vi.mocked(broadcastAdminDraft).mock.lastCall?.[1]).toMatchObject({
      logoImageStoragePath: 'hero/logo/new.png',
      logoImageUrl: 'https://cdn.example/logo.png',
      backgroundImageStoragePath: 'hero/background/new.png',
      backgroundImageUrl: 'https://cdn.example/background.png',
      tagline: 'Prior tagline',
    }))
    fireEvent.click(screen.getByRole('button', { name: 'Clear background' }))
    fireEvent.click(screen.getByRole('button', { name: 'Reset wordmark' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(updateSiteConfig).toHaveBeenCalledOnce())
    const saved = JSON.parse(String(vi.mocked(updateSiteConfig).mock.calls[0][0].get('value')))
    expect(saved.logoImageUrl).toBeNull()
    expect(saved.logoImageStoragePath).toBeNull()
    expect(saved.backgroundImageUrl).toBeNull()
    expect(saved.backgroundImageStoragePath).toBeNull()
    expect(saved.tagline).toBe('Prior tagline')
    expect(saved.powerGlitch.mode).toBe('off')
    expect(broadcastAdminDraft).toHaveBeenCalledWith('hero', expect.objectContaining({
      logoImageUrl: DEFAULT_HERO_LOGO_URL,
    }))
  })

  it('preserves save errors without success or refresh messages', async () => {
    vi.mocked(updateSiteConfig).mockResolvedValue({ error: 'Cannot save hero' })
    render(<HeroConfigEditor currentValue={{}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(screen.getByText('Cannot save hero')).toBeInTheDocument())
    expect(broadcastAdminRefresh).not.toHaveBeenCalled()
    expect(refresh).not.toHaveBeenCalled()
  })
})
