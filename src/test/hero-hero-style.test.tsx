import { describe, it, expect, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import Hero from '@/components/Hero'
import { LocaleProvider } from '@/contexts/LocaleContext'

// ── Stubs ──────────────────────────────────────────────────────────────────

vi.mock('framer-motion', async () => {
  const React = await import('react')

  function motionFactory(Tag: string) {
    return React.forwardRef(function MotionComponent(
      props: Record<string, unknown>,
      ref: React.Ref<HTMLElement>
    ) {
      const {
        initial: _i,
        animate: _a,
        exit: _e,
        transition: _t,
        whileTap: _w,
        variants: _v,
        ...rest
      } = props
      return React.createElement(Tag, { ...rest, ref })
    })
  }

  const motionProxy = new Proxy({} as Record<string, unknown>, {
    get(_target, prop: string) {
      return motionFactory(prop)
    },
  })

  return {
    motion: motionProxy,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  }
})

// Stub Logo3D to avoid Three.js / WebGL in unit tests
vi.mock('@/components/Logo3D', () => ({
  default: ({ className }: { className?: string }) => {
    return <div data-testid="logo3d-component" className={className} />
  },
}))

// ── Helper ─────────────────────────────────────────────────────────────────

function renderHero(props: Partial<React.ComponentProps<typeof Hero>> = {}) {
  return render(
    <LocaleProvider>
      <Hero name="Test Band" genres={['Metal', 'Industrial']} {...props} />
    </LocaleProvider>
  )
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Hero heroStyle prop', () => {
  it('renders without crashing when heroStyle is undefined', () => {
    const { container } = renderHero()
    expect(container.querySelector('#hero')).not.toBeNull()
  })

  it('renders the default 2D logo when heroStyle is "default"', () => {
    const { container, queryByTestId } = renderHero({ heroStyle: 'default' })
    expect(container.querySelector('#hero')).not.toBeNull()
    // Logo3D should NOT be rendered for default style
    expect(queryByTestId('logo3d-component')).toBeNull()
  })

  it('renders Logo3D when heroStyle is "glitch-parallax"', async () => {
    const { getByTestId } = renderHero({ heroStyle: 'glitch-parallax' })
    await waitFor(() => {
      expect(getByTestId('logo3d-component')).not.toBeNull()
    })
  })

  it('does NOT render Logo3D when heroStyle is "chromatic-hover"', () => {
    const { queryByTestId } = renderHero({ heroStyle: 'chromatic-hover' })
    expect(queryByTestId('logo3d-component')).toBeNull()
  })

  it('does NOT render Logo3D when heroStyle is "minimal"', () => {
    const { queryByTestId } = renderHero({ heroStyle: 'minimal' })
    expect(queryByTestId('logo3d-component')).toBeNull()
  })

  it('renders an img element for minimal heroStyle', () => {
    const { container, queryByTestId } = renderHero({ heroStyle: 'minimal' })
    // Should show a plain img, not the Logo3D component
    expect(queryByTestId('logo3d-component')).toBeNull()
    expect(container.querySelectorAll('img').length).toBeGreaterThanOrEqual(1)
  })

  it('passes the correct className to Logo3D when glitch-parallax', async () => {
    const { getByTestId } = renderHero({ heroStyle: 'glitch-parallax' })
    await waitFor(() => {
      const logo3d = getByTestId('logo3d-component')
      // The className prop should include a width class
      expect(logo3d.className).toContain('w-[')
    })
  })

  it('renders genre badges regardless of heroStyle', () => {
    const { getAllByText } = renderHero({
      heroStyle: 'glitch-parallax',
      genres: ['Metal', 'Industrial'],
    })
    expect(getAllByText('Metal').length).toBeGreaterThan(0)
    expect(getAllByText('Industrial').length).toBeGreaterThan(0)
  })
})
