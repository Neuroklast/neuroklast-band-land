import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import CyberpunkLoader from '@/components/CyberpunkLoader'
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
        whileHover: _wh,
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

// Stub Logo3D so we don't need WebGL / Three.js in tests
vi.mock('@/components/Logo3D', () => ({
  default: () => {
    return <div data-testid="logo3d-stub" />
  },
}))

// Prevent the progress interval from running indefinitely
vi.mock('@/lib/config', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/config')>()
  return {
    ...real,
    LOADER_PROGRESS_INTERVAL_MS: 100_000, // effectively paused
    LOADER_COMPLETE_DELAY_MS: 100_000,
    LOADER_PROGRESS_INCREMENT_MULTIPLIER: 0,
  }
})

vi.mock('@/lib/image-cache', () => ({
  loadCachedImage: () => Promise.resolve(undefined),
}))

// ── Helper ─────────────────────────────────────────────────────────────────

function renderLoader(props: Partial<React.ComponentProps<typeof CyberpunkLoader>> = {}) {
  return render(
    <LocaleProvider>
      <CyberpunkLoader onLoadComplete={vi.fn()} {...props} />
    </LocaleProvider>
  )
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('CyberpunkLoader loadingScreenType', () => {
  it('renders without crashing when no loadingScreenType is given', () => {
    const { container } = renderLoader()
    expect(container.firstChild).not.toBeNull()
  })

  it('renders the default (code-rain / cyberpunk) loader when loadingScreenType is undefined', () => {
    const { container } = renderLoader()
    // The wrapper div should be in the document
    expect(container.firstChild).not.toBeNull()
  })

  it('renders the default loader for loadingScreenType="code-rain"', () => {
    const { container } = renderLoader({ loadingScreenType: 'code-rain' })
    expect(container.firstChild).not.toBeNull()
  })

  it('renders the default loader for loadingScreenType="cyberpunk"', () => {
    const { container } = renderLoader({ loadingScreenType: 'cyberpunk' })
    expect(container.firstChild).not.toBeNull()
  })

  it('renders the minimal loader for loadingScreenType="minimal"', () => {
    const { getByTestId } = renderLoader({ loadingScreenType: 'minimal' })
    expect(getByTestId('loader-minimal')).not.toBeNull()
  })

  it('minimal loader does NOT show the 3D model element', () => {
    const { queryByTestId } = renderLoader({ loadingScreenType: 'minimal' })
    expect(queryByTestId('loader-3d-model')).toBeNull()
  })

  it('renders a spinner in the minimal loader', () => {
    const { container } = renderLoader({ loadingScreenType: 'minimal' })
    // The spinning element has rounded-full class
    const spinner = container.querySelector('.rounded-full')
    expect(spinner).not.toBeNull()
  })
})
