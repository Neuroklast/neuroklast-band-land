import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import HeroZardonic from '@/components/HeroZardonic'

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

vi.mock('@/lib/config', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/config')>()
  return {
    ...real,
    HERO_LOGO_GLITCH_PROBABILITY: 0,
    HERO_LOGO_GLITCH_DURATION_MS: 100,
    HERO_LOGO_GLITCH_INTERVAL_MS: 1_000_000,
    HERO_TITLE_GLITCH_PROBABILITY: 0,
    HERO_TITLE_GLITCH_DURATION_MS: 100,
    HERO_TITLE_GLITCH_INTERVAL_MS: 1_000_000,
  }
})

// ── Tests ──────────────────────────────────────────────────────────────────

describe('HeroZardonic', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <HeroZardonic name="Test Band" genres={['Industrial', 'Metal']} />
    )
    expect(container.querySelector('#hero')).not.toBeNull()
  })

  it('renders genre badges', () => {
    const { getAllByText } = render(
      <HeroZardonic name="Test Band" genres={['Industrial', 'Metal']} />
    )
    expect(getAllByText('Industrial').length).toBeGreaterThan(0)
    expect(getAllByText('Metal').length).toBeGreaterThan(0)
  })

  it('renders with empty genres', () => {
    const { container } = render(
      <HeroZardonic name="Test Band" genres={[]} />
    )
    expect(container.querySelector('#hero')).not.toBeNull()
  })

  it('renders with all optional props', () => {
    const { container } = render(
      <HeroZardonic
        name="Zardonic"
        genres={['Industrial Metal', 'Electronic']}
        editMode={false}
        onEdit={() => {}}
        logoUrl="/logo.png"
        titleImageUrl="/title.png"
        hudTopLeft1="SYS: NK-MAIN"
        hudTopLeft2="ONLINE"
        hudBottomRight1="FREQ: 140-180"
        hudBottomRight2="MODE: HARD"
      />
    )
    expect(container.querySelector('#hero')).not.toBeNull()
  })

  it('shows Edit Info button when editMode is true and onEdit is provided', () => {
    const onEdit = vi.fn()
    const { getByText } = render(
      <HeroZardonic
        name="Test Band"
        genres={['Industrial']}
        editMode={true}
        onEdit={onEdit}
      />
    )
    expect(getByText('Edit Info')).not.toBeNull()
  })

  it('does not show Edit Info button when editMode is false', () => {
    const { queryByText } = render(
      <HeroZardonic name="Test Band" genres={['Industrial']} editMode={false} />
    )
    expect(queryByText('Edit Info')).toBeNull()
  })

  it('renders img elements for logo and title', () => {
    const { container } = render(
      <HeroZardonic
        name="Test Band"
        genres={['Industrial']}
        logoUrl="/logo.svg"
        titleImageUrl="/title.png"
      />
    )
    const imgs = container.querySelectorAll('img')
    expect(imgs.length).toBeGreaterThanOrEqual(2)
  })

  it('renders ENTER button', () => {
    const { getByText } = render(
      <HeroZardonic name="Test Band" genres={['Industrial']} />
    )
    expect(getByText('ENTER')).not.toBeNull()
  })

  it('uses default HUD texts when not provided', () => {
    const { getByText } = render(
      <HeroZardonic name="Test Band" genres={[]} />
    )
    expect(getByText('SYS: NK-MAIN')).not.toBeNull()
    expect(getByText('FREQ: 140-180')).not.toBeNull()
    expect(getByText('MODE: HARD')).not.toBeNull()
  })

  it('uses custom HUD texts when provided', () => {
    const { getByText } = render(
      <HeroZardonic
        name="Test Band"
        genres={[]}
        hudTopLeft1="CUSTOM: SYS"
        hudBottomRight1="FREQ: 150-200"
      />
    )
    expect(getByText('CUSTOM: SYS')).not.toBeNull()
    expect(getByText('FREQ: 150-200')).not.toBeNull()
  })
})
