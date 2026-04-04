import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import SectionGuard from '@/components/SectionGuard'

// Stub framer-motion so that motion.div renders a regular div
vi.mock('framer-motion', async () => {
  const React = await import('react')

  function motionFactory(Tag: string) {
    return React.forwardRef(function MotionStub(
      props: Record<string, unknown>,
      ref: React.Ref<HTMLElement>,
    ) {
      const { initial: _i, animate: _a, transition: _t, exit: _e, ...rest } = props
      return React.createElement(Tag, { ...rest, ref } as Record<string, unknown>)
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

describe('SectionGuard', () => {
  it('renders children when sectionId is in activeSectionIds', () => {
    const { getByText } = render(
      <SectionGuard
        sectionId="news"
        activeSectionIds={['news', 'gigs']}
        delay={0.7}
        label="News"
      >
        <div>{"News Content"}</div>
      </SectionGuard>,
    )
    expect(getByText('News Content')).toBeDefined()
  })

  it('renders nothing when sectionId is NOT in activeSectionIds', () => {
    const { container } = render(
      <SectionGuard
        sectionId="news"
        activeSectionIds={['gigs', 'biography']}
        delay={0.7}
        label="News"
      >
        <div>{"News Content"}</div>
      </SectionGuard>,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing when activeSectionIds is empty', () => {
    const { container } = render(
      <SectionGuard
        sectionId="news"
        activeSectionIds={[]}
        delay={0.7}
        label="News"
      >
        <div>{"News Content"}</div>
      </SectionGuard>,
    )
    expect(container.innerHTML).toBe('')
  })
})
