import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AppearanceEditor } from '@/app/admin/(protected)/site-config/AppearanceEditor'
import { updateSiteConfig } from '@/app/admin/_actions/siteConfig'
import { broadcastAdminDraft, broadcastAdminRefresh } from '@/lib/admin-draft-channel'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}))
vi.mock('@/app/admin/_actions/siteConfig', () => ({
  updateSiteConfig: vi.fn(),
}))
vi.mock('@/lib/admin-draft-channel', () => ({
  broadcastAdminDraft: vi.fn(),
  broadcastAdminRefresh: vi.fn(),
}))
vi.mock('@/hooks/use-unsaved-changes', () => ({
  useUnsavedChanges: vi.fn(),
}))
vi.mock('@/app/admin/(protected)/site-config/AppearanceQuickStart', async () => {
  const { LOOKS } = await import('@/lib/looks')
  return {
    AppearanceQuickStart: ({
      onApplyLook,
      onSavePreset,
      onPresetNameChange,
    }: {
      onApplyLook: (look: typeof LOOKS[number]) => void
      onSavePreset: () => void
      onPresetNameChange: (value: string) => void
    }) => (
      <div>
        <button type="button" onClick={() => onApplyLook(LOOKS[1])}>Apply Glitch Noir</button>
        <button type="button" onClick={() => onPresetNameChange('  Custom  ')}>Set preset name</button>
        <button type="button" onClick={onSavePreset}>Save custom preset</button>
      </div>
    ),
  }
})
vi.mock('@/app/admin/(protected)/site-config/AppearanceColorsFonts', () => ({
  AppearanceColorsFonts: ({
    onThemeFieldChange,
  }: {
    onThemeFieldChange: (key: 'accentColor', value: string) => void
  }) => (
    <button
      type="button"
      onClick={() => onThemeFieldChange('accentColor', 'oklch(0.60 0.24 25)')}
    >
      Change theme accent
    </button>
  ),
}))
vi.mock('@/app/admin/(protected)/site-config/AppearanceVisualEffects', () => ({
  AppearanceVisualEffects: ({
    onCrtEnabledChange,
  }: {
    onCrtEnabledChange: (value: boolean) => void
  }) => <button type="button" onClick={() => onCrtEnabledChange(false)}>Disable CRT</button>,
}))

beforeEach(() => {
  vi.mocked(updateSiteConfig).mockResolvedValue({ success: true })
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('appearance editor reducer integration', () => {
  it('broadcasts one coherent look draft and saves the same persisted JSON', async () => {
    render(<AppearanceEditor currentValue={{}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Apply Glitch Noir' }))
    await waitFor(() => {
      expect(vi.mocked(broadcastAdminDraft).mock.lastCall?.[1]).toMatchObject({
        lookId: 'glitch-noir',
        chromaticStrength: 0.2,
        noiseIntensity: 0.1,
      })
    })
    const lastDraft = vi.mocked(broadcastAdminDraft).mock.lastCall?.[1]
    fireEvent.click(screen.getByRole('button', { name: 'Save theme' }))
    await waitFor(() => expect(updateSiteConfig).toHaveBeenCalledOnce())
    const formData = vi.mocked(updateSiteConfig).mock.calls[0][0]
    expect(formData.get('key')).toBe('appearance')
    expect(JSON.parse(String(formData.get('value')))).toEqual(lastDraft)
    await waitFor(() => {
      expect(broadcastAdminRefresh).toHaveBeenCalledOnce()
      expect(refresh).toHaveBeenCalledOnce()
    })
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })

  it('routes field changes and custom presets through the saved payload', async () => {
    render(<AppearanceEditor currentValue={{}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Disable CRT' }))
    fireEvent.click(screen.getByRole('button', { name: 'Change theme accent' }))
    fireEvent.click(screen.getByRole('button', { name: 'Set preset name' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save custom preset' }))
    const latest = vi.mocked(broadcastAdminDraft).mock.lastCall?.[1]
    await waitFor(() => expect(vi.mocked(broadcastAdminDraft).mock.lastCall?.[1]).toMatchObject({
      crtEnabled: false,
      savedPresets: [{ name: 'Custom' }],
    }))
    expect(useUnsavedChanges).toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Save theme' }))
    await waitFor(() => expect(updateSiteConfig).toHaveBeenCalledOnce())
    const saved = JSON.parse(String(vi.mocked(updateSiteConfig).mock.calls[0][0].get('value')))
    expect(saved.crtEnabled).toBe(false)
    expect(saved.savedPresets).toHaveLength(1)
    expect(saved.savedPresets[0].theme.accentColor).toBe('oklch(0.60 0.24 25)')
    expect(saved).toEqual(vi.mocked(broadcastAdminDraft).mock.lastCall?.[1])
    expect(latest).toBeDefined()
  })

  it('preserves the existing save error behavior without announcing success', async () => {
    vi.mocked(updateSiteConfig).mockResolvedValue({ error: 'Save denied' })
    render(<AppearanceEditor currentValue={{}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Save theme' }))
    await waitFor(() => expect(screen.getByText('Save denied')).toBeInTheDocument())
    expect(broadcastAdminRefresh).not.toHaveBeenCalled()
    expect(refresh).not.toHaveBeenCalled()
  })
})
