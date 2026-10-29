import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { BackgroundConfigEditor } from '@/app/admin/(protected)/site-config/BackgroundConfigEditor'
import { updateSiteConfig } from '@/app/admin/_actions/siteConfig'
import { broadcastAdminDraft, broadcastAdminRefresh } from '@/lib/admin-draft-channel'

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))
vi.mock('@/app/admin/_actions/siteConfig', () => ({ updateSiteConfig: vi.fn() }))
vi.mock('@/lib/admin-draft-channel', () => ({
  broadcastAdminDraft: vi.fn(),
  broadcastAdminRefresh: vi.fn(),
}))
vi.mock('@/hooks/use-unsaved-changes', () => ({ useUnsavedChanges: vi.fn() }))
vi.mock('@/app/admin/_components/MediaSourcePicker', () => ({ MediaSourcePicker: () => <div>Image picker</div> }))
vi.mock('@/app/admin/(protected)/site-config/BackgroundDesktopVideoControls', () => ({
  BackgroundDesktopVideoControls: ({
    onResolved, onCleared, onToggleEnabled,
  }: {
    onResolved: (path: string, url?: string) => void
    onCleared: () => void
    onToggleEnabled: () => void
  }) => <div>
    <button type="button" onClick={() => onResolved('background/videos/desktop.mp4', 'https://cdn.example/desktop.mp4')}>Upload desktop</button>
    <button type="button" onClick={onCleared}>Clear desktop</button>
    <button type="button" onClick={onToggleEnabled}>Toggle desktop</button>
  </div>,
}))
vi.mock('@/app/admin/(protected)/site-config/BackgroundMobileVideoControls', () => ({
  BackgroundMobileVideoControls: ({
    onModeChange, onResolved, onCleared,
  }: {
    onModeChange: (mode: 'same' | 'separate' | 'off') => void
    onResolved: (path: string, url?: string) => void
    onCleared: () => void
  }) => <div>
    <button type="button" onClick={() => onModeChange('separate')}>Separate mobile</button>
    <button type="button" onClick={() => onModeChange('off')}>Disable mobile</button>
    <button type="button" onClick={() => onResolved('background/videos/mobile.mp4', 'https://cdn.example/mobile.mp4')}>Upload mobile</button>
    <button type="button" onClick={onCleared}>Clear mobile</button>
  </div>,
}))

beforeEach(() => vi.mocked(updateSiteConfig).mockResolvedValue({ success: true }))
afterEach(() => { cleanup(); vi.clearAllMocks() })

describe('background editor preview/save integration', () => {
  it('enables desktop video on upload and omits unselected fields in draft broadcast', async () => {
    render(<BackgroundConfigEditor currentValue={{}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Upload desktop' }))
    await waitFor(() => expect(broadcastAdminDraft).toHaveBeenCalledWith('background',
      expect.objectContaining({
        video_storage_path: 'background/videos/desktop.mp4',
        video_url: 'https://cdn.example/desktop.mp4',
        backgroundVideoEnabled: true,
        mobileVideoMode: 'same',
      }),
    ))
    const preview = vi.mocked(broadcastAdminDraft).mock.lastCall?.[1]
    expect(preview?.storage_path).toBeUndefined()
    fireEvent.click(screen.getByRole('button', { name: 'Save background' }))
    await waitFor(() => expect(updateSiteConfig).toHaveBeenCalledOnce())
    const saved = JSON.parse(String(vi.mocked(updateSiteConfig).mock.calls[0][0].get('value')))
    expect(saved.storage_path).toBeNull()
    expect(saved.video_storage_path).toBe('background/videos/desktop.mp4')
    expect(saved.backgroundVideoEnabled).toBe(true)
    await waitFor(() => expect(broadcastAdminRefresh).toHaveBeenCalledOnce())
    expect(refresh).toHaveBeenCalledOnce()
  })

  it('keeps mobile preview data but excludes it from save unless separate mode is active', async () => {
    render(<BackgroundConfigEditor currentValue={{}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Upload mobile' }))
    await waitFor(() => expect(vi.mocked(broadcastAdminDraft).mock.lastCall?.[1]).toMatchObject({
      mobileVideoMode: 'same',
      video_mobile_storage_path: 'background/videos/mobile.mp4',
    }))
    fireEvent.click(screen.getByRole('button', { name: 'Save background' }))
    await waitFor(() => expect(updateSiteConfig).toHaveBeenCalledOnce())
    const first = JSON.parse(String(vi.mocked(updateSiteConfig).mock.calls[0][0].get('value')))
    expect(first.video_mobile_storage_path).toBeNull()
    expect(first.video_mobile_url).toBeNull()
  })

  it('preserves the existing save failure UI without announcing success', async () => {
    vi.mocked(updateSiteConfig).mockResolvedValue({ error: 'Save failed' })
    render(<BackgroundConfigEditor currentValue={{}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Save background' }))
    await waitFor(() => expect(screen.getByText('Save failed')).toBeInTheDocument())
    expect(broadcastAdminRefresh).not.toHaveBeenCalled()
    expect(refresh).not.toHaveBeenCalled()
  })
})
