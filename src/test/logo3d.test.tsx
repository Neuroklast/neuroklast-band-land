import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import Logo3D from '@/components/Logo3D'

// ── Stubs ──────────────────────────────────────────────────────────────────

// Canvas mock: renders the container div but NOT children since the R3F
// reconciler is not loaded outside a real Canvas context.
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ 'data-testid': _t, ...rest }: Record<string, unknown>) => {
    // We only render the wrapper, not the children, to avoid R3F JSX rendering
    const { children: _c, ...divProps } = rest
    return <div data-testid="r3f-canvas" {...(divProps as Record<string, unknown>)} />
  },
  useFrame: vi.fn(),
}))

vi.mock('@react-three/drei', () => ({
  useGLTF: vi.fn(() => ({ scene: { traverse: vi.fn() } })),
  Text: ({ children }: { children: React.ReactNode }) => {
    return <span>{children}</span>
  },
}))

vi.mock('three', () => {
  function MockColor() {}
  function MockMesh() {}
  function MockMeshStandardMaterial() {}
  function MockGroup() {}
  return {
    Color: MockColor,
    Mesh: MockMesh,
    MeshStandardMaterial: MockMeshStandardMaterial,
    Group: MockGroup,
  }
})

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Logo3D', () => {
  beforeEach(() => {
    // Simulate WebGL being available so we get the Canvas path
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      {} as never
    )
  })

  it('renders without crashing', () => {
    const { container } = render(<Logo3D />)
    expect(container.firstChild).not.toBeNull()
  })

  it('renders the canvas wrapper when WebGL is available', () => {
    const { getByTestId } = render(<Logo3D />)
    expect(getByTestId('logo3d-canvas-wrapper')).not.toBeNull()
  })

  it('accepts a className prop', () => {
    const { getByTestId } = render(<Logo3D className="my-custom-class" />)
    const wrapper = getByTestId('logo3d-canvas-wrapper')
    expect(wrapper.className).toContain('my-custom-class')
  })

  it('renders the WebGL fallback when WebGL is NOT available', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    const { getByTestId } = render(<Logo3D />)
    expect(getByTestId('logo3d-webgl-fallback')).not.toBeNull()
  })

  it('does NOT render canvas wrapper when WebGL is not available', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    const { queryByTestId } = render(<Logo3D />)
    expect(queryByTestId('logo3d-canvas-wrapper')).toBeNull()
  })
})
