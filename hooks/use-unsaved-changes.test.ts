import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useUnsavedChanges } from './use-unsaved-changes'

describe('useUnsavedChanges', () => {
  beforeEach(() => {
    vi.spyOn(window, 'addEventListener')
    vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not listen when clean', () => {
    renderHook(() => useUnsavedChanges(false))
    expect(window.addEventListener).not.toHaveBeenCalledWith('beforeunload', expect.any(Function))
  })

  it('warns on unload while dirty and cleans up', () => {
    const { unmount } = renderHook(() => useUnsavedChanges(true))
    expect(window.addEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function))
    unmount()
    expect(window.removeEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function))
  })
})
