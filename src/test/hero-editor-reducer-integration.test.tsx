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
  HeroWordmarkControls: () => <div>Wordmark controls</div>,
}))
vi.mock('@/app/admin/(protected)/site-config/HeroBackgroundControls', () => ({
  HeroBackgroundControls: () => <div>Background controls</div>,
}))
vi.mock('@/app/admin/(protected)/site-config/HeroGlitchControls', () => ({
  HeroGlitchControls: ({
    onModeChange, onSliceCountChange, onShakeChange,
  }: {
    onModeChange: (mode: 'hover') => void
    onSliceCountChange: (count: number) => void
    onShakeChange: (enabled: boolean) => void
  }) => (
    <div>
      <button type="button" onClick={() => onModeChange('hover')}>Set Hover</button>
      <button type="button" onClick={() => onSliceCountChange(9)}>Set Slices</button>
      <button type="button" onClick={() => onShakeChange(false)}>Disable Shake</button>
    </div>
  ),
}))

beforeEach(() => { vi.mocked(updateSiteConfig).mockResolvedValue({ success: true }) })
afterEach(() => { cleanup(); vi.clearAllMocks() })

describe('hero reducer parent integration', () => {
  it('updates several hero controls and persists the exact latest draft while preserving preview contract', async () => {
    render(<HeroConfigEditor currentValue={{ tagline: 'Original tagline' }} />)
    fireEvent.change(screen.getByLabelText('Tagline'), { target: { value: 'New tagline' } })
    fireEvent.click(screen.getByRole('switch', { name: 'Enable wordmark boot sequence' }))
    fireEvent.click(screen.getByRole('button', { name: 'Set Hover' }))
    fireEvent.click(screen.getByRole('button', { name: 'Set Slices' }))
    fireEvent.click(screen.getByRole('button', { name: 'Disable Shake' }))

    await waitFor(() => expect(vi.mocked(broadcastAdminDraft).mock.lastCall?.[1]).toMatchObject({
      tagline: 'New tagline',
      bootSequenceEnabled: false,
      powerGlitch: { mode: 'hover', sliceCount: 9, shake: false, durationMs: 2000 },
    }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(updateSiteConfig).toHaveBeenCalledOnce())
    const formData = vi.mocked(updateSiteConfig).mock.calls[0][0]
    expect(formData.get('key')).toBe('hero')
    const saved = JSON.parse(String(formData.get('value')))
    expect(saved).toMatchObject({
      tagline: 'New tagline', bootSequenceEnabled: false,
      powerGlitch: { mode: 'hover', sliceCount: 9, shake: false },
    })
    expect(saved.logoImageUrl).toBeNull()
    expect(vi.mocked(broadcastAdminDraft).mock.lastCall?.[1]).toMatchObject({
      ...saved,
      // The public draft has a preview fallback; the saved JSON must keep null.
      logoImageUrl: DEFAULT_HERO_LOGO_URL,
    })
    await waitFor(() => expect(broadcastAdminRefresh).toHaveBeenCalledOnce())
    expect(refresh).toHaveBeenCalledOnce()
  })

  it('preserves the error state and skips refresh when persistence fails', async () => {
    vi.mocked(updateSiteConfig).mockResolvedValue({ error: 'Save rejected' })
    render(<HeroConfigEditor currentValue={{}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(screen.getByText('Save rejected')).toBeInTheDocument())
    expect(broadcastAdminRefresh).not.toHaveBeenCalled()
    expect(refresh).not.toHaveBeenCalled()
  })
})
