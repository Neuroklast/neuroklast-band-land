import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PhaseCrossfade } from '@/components/motion/PhaseCrossfade'
import { HatchDoors } from '@/components/motion/HatchDoors'

describe('PhaseCrossfade', () => {
  it('shows only outgoing at progress 0', () => {
    render(<PhaseCrossfade progress={0} outgoing={<p>OUT</p>} incoming={<p>IN</p>} />)
    expect(screen.getByText('OUT')).toBeInTheDocument()
    expect(screen.queryByText('IN')).not.toBeInTheDocument()
  })

  it('keeps incoming mounted at progress 0 when holdIncoming', () => {
    render(
      <PhaseCrossfade progress={0} holdIncoming outgoing={<p>OUT</p>} incoming={<p>IN</p>} />,
    )
    expect(screen.getByText('OUT')).toBeInTheDocument()
    expect(screen.getByText('IN')).toBeInTheDocument()
  })

  it('shows only incoming at progress 1', () => {
    render(<PhaseCrossfade progress={1} outgoing={<p>OUT</p>} incoming={<p>IN</p>} />)
    expect(screen.queryByText('OUT')).not.toBeInTheDocument()
    expect(screen.getByText('IN')).toBeInTheDocument()
  })
})

describe('HatchDoors', () => {
  it('renders closed doors when active at progress 0', () => {
    const { container } = render(
      <div className="relative">
        <HatchDoors progress={0} active />
      </div>,
    )
    expect(container.querySelectorAll('[aria-hidden] > div')).toHaveLength(2)
  })

  it('hides when inactive or fully open', () => {
    const { rerender, container } = render(<HatchDoors progress={0} active={false} />)
    expect(container.querySelector('[aria-hidden]')).toBeNull()
    rerender(<HatchDoors progress={1} active />)
    expect(container.querySelector('[aria-hidden]')).toBeNull()
  })
})
