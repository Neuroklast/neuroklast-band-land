import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '@/contexts/LocaleContext'
import { SecretTerminalPage } from '@/app/_components/public/SecretTerminalPage'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/nk-sec',
}))

function stubDesktop() {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1280 })
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn((query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    })),
  })
}

describe('SecretTerminalPage', () => {
  it('shows the auth gate before the terminal', () => {
    stubDesktop()
    render(
      <LocaleProvider>
        <SecretTerminalPage />
      </LocaleProvider>,
    )
    expect(screen.getByText(/BIOMETRIC\.GATE/)).toBeInTheDocument()
    expect(screen.queryByText(/TERMINAL ACTIVE/i)).not.toBeInTheDocument()
  })

  it('goes home when the gate is dismissed', () => {
    stubDesktop()
    push.mockReset()
    render(
      <LocaleProvider>
        <SecretTerminalPage />
      </LocaleProvider>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(push).toHaveBeenCalledWith('/')
  })
})
