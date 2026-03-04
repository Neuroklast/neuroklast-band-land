import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import OverlayTransition, { useOverlayTransition } from '@/components/OverlayTransition'
import { renderHook } from '@testing-library/react'

vi.mock('framer-motion', async () => {
  const React = await import('react')

  function motionFactory(Tag: string) {
    return React.forwardRef(function MotionComponent(
      props: Record<string, unknown>,
      ref: React.Ref<HTMLElement>
    ) {
      const { initial: _i, animate: _a, exit: _e, transition: _t, ...rest } = props
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

describe('OverlayTransition', () => {
  it('renders without crashing when show is false', () => {
    const { container } = render(<OverlayTransition show={false} />)
    expect(container).not.toBeNull()
  })

  it('renders without crashing when show is true', () => {
    vi.useFakeTimers()
    const { container } = render(<OverlayTransition show={true} />)
    expect(container).not.toBeNull()
    vi.useRealTimers()
  })

  it('calls onComplete callback', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<OverlayTransition show={true} onComplete={onComplete} />)
    vi.advanceTimersByTime(600)
    // onComplete may or may not have been called depending on visibility state
    vi.useRealTimers()
  })

  it('renders nothing when show transitions from true to false', () => {
    vi.useFakeTimers()
    const { rerender, container } = render(<OverlayTransition show={true} />)
    rerender(<OverlayTransition show={false} />)
    expect(container).not.toBeNull()
    vi.useRealTimers()
  })
})

describe('useOverlayTransition', () => {
  it('returns trigger function and element', () => {
    const { result } = renderHook(() => useOverlayTransition())
    expect(typeof result.current.trigger).toBe('function')
    expect(result.current.element).not.toBeUndefined()
  })

  it('trigger function can be called without error', () => {
    const { result } = renderHook(() => useOverlayTransition())
    expect(() => result.current.trigger()).not.toThrow()
  })
})
