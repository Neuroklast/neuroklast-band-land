import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SecretTerminalTrigger } from '@/app/_components/public/SecretTerminalTrigger'
import { requestSecretTerminal, TERMINAL_AUTH_PATH, TERMINAL_CHEAT_PARAM } from '@/lib/terminal-config'

const push = vi.fn()
let pathname = '/'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => pathname,
}))

function fireKey(key: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key }))
}

describe('SecretTerminalTrigger', () => {
  beforeEach(() => {
    push.mockReset()
    pathname = '/'
  })

  afterEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('navigates to the secret page on Konami instead of opening an overlay', () => {
    render(<SecretTerminalTrigger secretCode={['x', 'y']} />)

    act(() => {
      fireKey('x')
      fireKey('y')
    })

    expect(push).toHaveBeenCalledWith(TERMINAL_AUTH_PATH)
  })

  it('navigates from requestSecretTerminal', () => {
    render(<SecretTerminalTrigger secretCode={['x', 'y']} />)
    act(() => {
      requestSecretTerminal()
    })
    expect(push).toHaveBeenCalledWith(TERMINAL_AUTH_PATH)
  })

  it('navigates from the cheat query param', () => {
    window.history.replaceState({}, '', `/?${TERMINAL_CHEAT_PARAM}`)
    render(<SecretTerminalTrigger secretCode={['x', 'y']} />)
    expect(push).toHaveBeenCalledWith(TERMINAL_AUTH_PATH)
  })

  it('does not navigate when already on the secret page', () => {
    pathname = TERMINAL_AUTH_PATH
    render(<SecretTerminalTrigger secretCode={['x', 'y']} />)
    act(() => {
      fireKey('x')
      fireKey('y')
    })
    expect(push).not.toHaveBeenCalled()
  })
})
