/**
 * Logo3D — Three.js-based 3D logo for the hero section.
 *
 * Loads a GLB model from `src/assets/models/ZARDONICTEXT.glb` when available.
 * Falls back to a 3D box placeholder with the same scroll-parallax animation
 * when the GLB file is absent or WebGL is not supported by the browser.
 *
 * Primary colour is read from the `--primary` CSS variable so it automatically
 * adapts to the active theme preset.
 */
import { useRef, useEffect, useState, Suspense, startTransition } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Text } from '@react-three/drei'
import * as THREE from 'three'

// Discover GLB assets at build time via Vite's import.meta.glob.
// The record is empty when no .glb files are present in the folder.
const glbModels = import.meta.glob('../assets/models/*.glb', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>

const MODEL_KEY = '../assets/models/ZARDONICTEXT.glb'
const modelUrl: string | undefined = glbModels[MODEL_KEY]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve the current `--primary` CSS variable to an sRGB hex string via a
 *  1×1 canvas, since Three.js `Color` does not yet fully handle oklch. */
function resolvePrimaryColor(): string {
  try {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary')
      .trim()
    if (!raw) return '#ff2222'
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    const ctx = canvas.getContext('2d')
    if (!ctx) return '#ff2222'
    ctx.fillStyle = raw
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    return `rgb(${r},${g},${b})`
  } catch {
    return '#ff2222'
  }
}

// ---------------------------------------------------------------------------
// Scene sub-components (must be rendered inside a <Canvas>)
// ---------------------------------------------------------------------------

interface MeshProps {
  primaryColor: string
  scrollY: number
}

/** Renders the loaded GLTF scene with metallic emissive material. */
function LogoModel({ url, primaryColor, scrollY }: MeshProps & { url: string }) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF(url)

  // Apply theme-aware material to every mesh in the loaded scene
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(primaryColor),
          emissive: new THREE.Color(primaryColor),
          emissiveIntensity: 0.3,
          metalness: 0.8,
          roughness: 0.2,
        })
      }
    })
  }, [scene, primaryColor])

  // Scroll-driven parallax
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = scrollY * 0.001
      groupRef.current.rotation.x = scrollY * 0.0005
      groupRef.current.position.z = -scrollY * 0.01
    }
  })

  return <primitive ref={groupRef} object={scene} />
}

/** Fallback 3D box rendered when no GLB model is available. */
function FallbackLogoBox({ primaryColor, scrollY }: MeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5
      meshRef.current.rotation.x = scrollY * 0.0005
    }
  })

  return (
    <group>
      <mesh ref={meshRef}>
        <boxGeometry args={[3, 1, 0.3]} />
        <meshStandardMaterial
          color={new THREE.Color(primaryColor)}
          emissive={new THREE.Color(primaryColor)}
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <Text
        position={[0, 0, 0.2]}
        fontSize={0.35}
        color={primaryColor}
        anchorX="center"
        anchorY="middle"
      >
        LOGO
      </Text>
    </group>
  )
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export interface Logo3DProps {
  className?: string
}

export default function Logo3D({ className }: Logo3DProps) {
  const [scrollY, setScrollY] = useState(0)
  const [webGLSupported] = useState(() => {
    try {
      const testCanvas = document.createElement('canvas')
      return !!(testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl'))
    } catch {
      return false
    }
  })
  const [primaryColor, setPrimaryColor] = useState('#ff2222')

  useEffect(() => {
    // Read primary colour after mount so CSS vars are resolved
    startTransition(() => setPrimaryColor(resolvePrimaryColor()))

    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!webGLSupported) {
    // Plain fallback when the browser does not support WebGL
    return (
      <div
        className={className}
        data-testid="logo3d-webgl-fallback"
        style={{ width: '100%', height: '16rem', background: 'transparent' }}
      />
    )
  }

  return (
    <div
      className={className}
      style={{ width: '100%', height: '16rem' }}
      data-testid="logo3d-canvas-wrapper"
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight
          position={[-10, -10, -10]}
          color={primaryColor}
          intensity={0.5}
        />
        {modelUrl ? (
          <Suspense
            fallback={
              <FallbackLogoBox
                primaryColor={primaryColor}
                scrollY={scrollY}
              />
            }
          >
            <LogoModel
              url={modelUrl}
              primaryColor={primaryColor}
              scrollY={scrollY}
            />
          </Suspense>
        ) : (
          <FallbackLogoBox primaryColor={primaryColor} scrollY={scrollY} />
        )}
      </Canvas>
    </div>
  )
}
