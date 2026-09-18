import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CyberpunkOverlay from '@/components/CyberpunkOverlay'
import { LocaleProvider } from '@/contexts/LocaleContext'

function renderOverlay(ui: ReactNode) {
  return render(<LocaleProvider>{ui}</LocaleProvider>)
}

const newsOverlay = {
  type: 'news' as const,
  data: {
    id: 'n1',
    title: 'Drop',
    slug: 'drop',
    excerpt: 'New single',
    body: 'New single',
    link: null,
    coverUrl: null,
    publishedAt: '2026-01-18',
  },
}

describe('CyberpunkOverlay boot animation', () => {
  it('renders the selected shell loader on the modal card', () => {
    renderOverlay(
      <CyberpunkOverlay
        overlay={newsOverlay}
        onClose={() => {}}
        adminSettings={undefined}
        overlayAnimations={['circuitBreak']}
      />,
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('data-overlay-clip')
    expect(dialog).toHaveAttribute('data-overlay-animation', 'circuitBreak')
    expect(dialog.querySelector('.overlay-loader-circuit')).toBeTruthy()
    expect(screen.getByText('CIRCUIT LINK')).toBeInTheDocument()
    expect(screen.getByText('> ACCESSING PROFILE...')).toBeInTheDocument()
  })

  it('renders interior boot UI for handshake animations', () => {
    renderOverlay(
      <CyberpunkOverlay
        overlay={newsOverlay}
        onClose={() => {}}
        adminSettings={undefined}
        overlayAnimations={['circuitHandshake']}
      />,
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('data-overlay-animation', 'circuitHandshake')
    expect(screen.getByText('CIRCUIT LINK')).toBeInTheDocument()
    expect(dialog.querySelector('.overlay-loader-circuit')).toBeTruthy()
  })

  it('keeps the same animation when the pool array identity changes', () => {
    const { rerender } = renderOverlay(
      <CyberpunkOverlay
        overlay={newsOverlay}
        onClose={() => {}}
        adminSettings={undefined}
        overlayAnimations={['systemBoot']}
      />,
    )

    expect(screen.getByRole('dialog')).toHaveAttribute('data-overlay-animation', 'systemBoot')

    rerender(
      <LocaleProvider>
        <CyberpunkOverlay
          overlay={newsOverlay}
          onClose={() => {}}
          adminSettings={undefined}
          overlayAnimations={['systemBoot']}
        />
      </LocaleProvider>,
    )

    expect(screen.getByRole('dialog')).toHaveAttribute('data-overlay-animation', 'systemBoot')
    expect(screen.getByText('BOOTING SYSTEM')).toBeInTheDocument()
  })

  it('keeps the shell mounted on close until the drop handoff finishes', () => {
    const { rerender } = renderOverlay(
      <CyberpunkOverlay
        overlay={newsOverlay}
        onClose={() => {}}
        adminSettings={undefined}
        overlayAnimations={['circuitBreak']}
      />,
    )

    rerender(
      <LocaleProvider>
        <CyberpunkOverlay
          overlay={null}
          onClose={() => {}}
          adminSettings={undefined}
          overlayAnimations={['circuitBreak']}
        />
      </LocaleProvider>,
    )

    const dialog = screen.queryByRole('dialog')
    if (dialog) {
      expect(dialog).toHaveAttribute('data-overlay-closing')
    }
  })

  it('uses the artist name in the overlay title', () => {
    renderOverlay(
      <CyberpunkOverlay
        overlay={newsOverlay}
        onClose={() => {}}
        adminSettings={undefined}
        overlayAnimations={['circuitBreak']}
        artistName="Neuroklast"
      />,
    )
    expect(screen.getByText(/NEUROKLAST\.NET/i)).toBeInTheDocument()
  })

  it('skips boot loaders for the secret terminal overlay', () => {
    renderOverlay(
      <CyberpunkOverlay
        overlay={{ type: 'terminal' }}
        onClose={() => {}}
        adminSettings={undefined}
        overlayAnimations={['circuitHandshake']}
      />,
    )

    expect(screen.queryByText('CIRCUIT LINK')).not.toBeInTheDocument()
    expect(screen.queryByText('> ACCESSING PROFILE...')).not.toBeInTheDocument()
    expect(screen.getByText(/TERMINAL ACTIVE/i)).toBeInTheDocument()
  })
})

describe('overlay loader CSS', () => {
  it('does not flatten overlay-loader classes in animations.css', () => {
    const css = readFileSync(resolve('src/animations.css'), 'utf8')
    expect(css).not.toMatch(/\.overlay-loader-circuit,\s*\n\.overlay-loader-boot/)
    expect(css).not.toMatch(/overlay-loader-blink/)
  })
})
