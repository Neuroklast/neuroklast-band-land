import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  hasCompletedPublicBoot,
  markPublicBootComplete,
  PUBLIC_BOOT_SESSION_KEY,
} from '@/lib/public-boot-session'

vi.mock('@/themes/neuroklast-classic/LoadingScreen', () => ({
  default: () => <div data-testid="public-boot" />,
}))

import { PublicBoot } from '@/app/_components/public/LookChrome'

describe('public boot session', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('is incomplete until marked', () => {
    expect(hasCompletedPublicBoot()).toBe(false)
    markPublicBootComplete()
    expect(hasCompletedPublicBoot()).toBe(true)
    expect(sessionStorage.getItem(PUBLIC_BOOT_SESSION_KEY)).toBe('1')
  })

  it('skips the loading screen after it has been shown once', async () => {
    const first = render(<PublicBoot loadingScreen={{ enabled: true }} />)
    expect(screen.getByTestId('public-boot')).toBeInTheDocument()
    await waitFor(() => expect(hasCompletedPublicBoot()).toBe(true))
    first.unmount()

    render(<PublicBoot loadingScreen={{ enabled: true }} />)
    expect(screen.queryByTestId('public-boot')).not.toBeInTheDocument()
  })
})
