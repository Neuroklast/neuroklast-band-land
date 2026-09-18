import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '@/contexts/LocaleContext'
import { TerminalAuthGate } from '@/components/overlays/TerminalAuthGate'
import { TERMINAL_AUTH } from '@/lib/terminal-auth-physics'

function stubMatchMedia(flags: { coarse?: boolean; hoverNone?: boolean; reduced?: boolean }) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn((query: string) => {
      const matches =
        (query.includes('pointer: coarse') && Boolean(flags.coarse)) ||
        (query.includes('hover: none') && Boolean(flags.hoverNone)) ||
        (query.includes('prefers-reduced-motion') && Boolean(flags.reduced))
      return {
        matches,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
        onchange: null,
      }
    }),
  })
}

function renderGate(onUnlock = vi.fn(), onDismiss = vi.fn()) {
  render(
    <LocaleProvider>
      <TerminalAuthGate onUnlock={onUnlock} onDismiss={onDismiss} />
    </LocaleProvider>,
  )
  return { onUnlock, onDismiss }
}

describe('TerminalAuthGate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('uses the fingerprint scanner on a mobile viewport', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 390 })
    stubMatchMedia({})
    renderGate()
    expect(screen.getByRole('button', { name: /hold/i })).toBeInTheDocument()
    expect(screen.getByText(/PLACE THUMB ON SCANNER/i)).toBeInTheDocument()
    expect(screen.queryByRole('slider')).not.toBeInTheDocument()
  })

  it('renders a full-screen dialog', () => {
    stubMatchMedia({ coarse: true })
    renderGate()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/BIOMETRIC\.GATE/)).toBeInTheDocument()
  })

  it('dismisses on Escape and close, not backdrop click', () => {
    stubMatchMedia({ coarse: true })
    const { onDismiss, onUnlock } = renderGate()

    fireEvent.click(screen.getByRole('dialog'))
    expect(onDismiss).not.toHaveBeenCalled()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onDismiss).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /close dialog/i }))
    expect(onDismiss).toHaveBeenCalledTimes(2)
    expect(onUnlock).not.toHaveBeenCalled()
  })

  it('unlocks fingerprint after a 2s hold', async () => {
    stubMatchMedia({ coarse: true })
    const { onUnlock } = renderGate()
    const pad = screen.getByRole('button', { name: /hold/i })

    fireEvent.pointerDown(pad)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(TERMINAL_AUTH.HOLD_MS + TERMINAL_AUTH.GRANT_HOLD_MS + 64)
    })

    expect(onUnlock).toHaveBeenCalledTimes(1)
  })

  it('does not unlock fingerprint if contact is lost early', async () => {
    stubMatchMedia({ coarse: true })
    const { onUnlock } = renderGate()
    const pad = screen.getByRole('button', { name: /hold/i })

    fireEvent.pointerDown(pad)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    fireEvent.pointerUp(pad)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(TERMINAL_AUTH.HOLD_MS + TERMINAL_AUTH.GRANT_HOLD_MS)
    })

    expect(onUnlock).not.toHaveBeenCalled()
    expect(screen.getByText('RETRY')).toBeInTheDocument()
  })

  it('unlocks the slider after a sustained drag', async () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1280 })
    stubMatchMedia({})
    HTMLElement.prototype.getBoundingClientRect = () =>
      ({ width: 360, height: 44, top: 0, left: 0, bottom: 44, right: 360, x: 0, y: 0, toJSON: () => {} }) as DOMRect

    const { onUnlock } = renderGate()
    const handle = screen.getByRole('slider')

    fireEvent.pointerDown(handle, { clientX: 0 })
    for (let index = 1; index <= 70; index += 1) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(16)
      })
      fireEvent.pointerMove(window, { clientX: index * 40 })
    }
    await act(async () => {
      await vi.advanceTimersByTimeAsync(TERMINAL_AUTH.GRANT_HOLD_MS + 32)
    })

    expect(onUnlock).toHaveBeenCalledTimes(1)
  })

  it('rejects a slider flick', async () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1280 })
    stubMatchMedia({})
    HTMLElement.prototype.getBoundingClientRect = () =>
      ({ width: 360, height: 44, top: 0, left: 0, bottom: 44, right: 360, x: 0, y: 0, toJSON: () => {} }) as DOMRect

    const { onUnlock } = renderGate()
    const handle = screen.getByRole('slider')

    fireEvent.pointerDown(handle, { clientX: 0 })
    fireEvent.pointerMove(window, { clientX: 2000 })
    fireEvent.pointerUp(window)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200)
    })

    expect(onUnlock).not.toHaveBeenCalled()
  })

  it('grants immediately on reduced-motion activation', async () => {
    stubMatchMedia({ coarse: true, reduced: true })
    const { onUnlock } = renderGate()
    fireEvent.click(screen.getByRole('button', { name: /hold/i }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(TERMINAL_AUTH.GRANT_HOLD_MS + 16)
    })
    expect(onUnlock).toHaveBeenCalledTimes(1)
  })
})
