import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AdminEditorLayout } from '@/app/admin/_components/AdminEditorLayout'
import { AdminSaveBar } from '@/app/admin/_components/AdminSaveBar'
import { useAdminEditorTab } from '@/app/admin/_components/useAdminEditorTab'

const tabs = [
  { id: 'page', label: 'Product page' },
  { id: 'media', label: 'Media' },
  { id: 'pricing', label: 'Pricing' },
] as const
const ids = tabs.map((tab) => tab.id)

describe('admin editor navigation', () => {
  beforeEach(() => window.history.replaceState(null, '', '/admin/plugins/123'))

  it('activates sections with their accessible names', () => {
    const change = vi.fn()
    render(
      <AdminEditorLayout tabs={tabs} activeTab="media" onTabChange={change} idPrefix="test">
        <p>Editor contents</p>
      </AdminEditorLayout>,
    )

    expect(screen.getByRole('button', { name: 'Media' }).getAttribute('aria-current')).toBe('location')
    fireEvent.click(screen.getByRole('button', { name: 'Pricing' }))
    expect(change).toHaveBeenCalledWith('pricing')
    expect(screen.getByText('Editor contents')).toBeTruthy()
  })

  it('keeps the active section in the URL and responds to back/forward', () => {
    window.history.replaceState(null, '', '/admin/plugins/123?tab=media')
    const { result } = renderHook(() => useAdminEditorTab(ids, 'page'))
    expect(result.current[0]).toBe('media')

    act(() => result.current[1]('pricing'))
    expect(new URLSearchParams(window.location.search).get('tab')).toBe('pricing')

    act(() => {
      window.history.replaceState(null, '', '/admin/plugins/123?tab=media')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(result.current[0]).toBe('media')
  })

  it('ignores invalid query sections', () => {
    window.history.replaceState(null, '', '/admin/plugins/123?tab=invalid')
    const { result } = renderHook(() => useAdminEditorTab(ids, 'page'))
    expect(result.current[0]).toBe('page')
  })
})

describe('admin save bar', () => {
  it('submits the correct form and blocks saving with no changes', () => {
    const { rerender } = render(<AdminSaveBar formId="product" dirty={false} busy={false} />)
    const save = screen.getByRole('button', { name: 'Save changes' }) as HTMLButtonElement
    expect(save.disabled).toBe(true)
    expect(save.getAttribute('form')).toBe('product')

    rerender(<AdminSaveBar formId="product" dirty busy={false} />)
    expect(save.disabled).toBe(false)
    expect(screen.getByText('Unsaved changes')).toBeTruthy()

    rerender(<AdminSaveBar formId="product" dirty busy />)
    expect(screen.getByRole('button', { name: 'Saving…' }).hasAttribute('disabled')).toBe(true)
  })

  it('shows explicit save errors rather than hiding them off-screen', () => {
    render(<AdminSaveBar formId="product" dirty busy={false} message="Failed to save" />)
    expect(screen.getByRole('status').textContent).toBe('Failed to save')
  })
})
