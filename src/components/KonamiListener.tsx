import { useEffect } from 'react'

interface KonamiListenerProps {
  onCodeActivated: () => void
}

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a'
]

export default function KonamiListener({ onCodeActivated }: KonamiListenerProps) {
  useEffect(() => {
    let konamiIndex = 0

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      const expectedKey = KONAMI_CODE[konamiIndex].toLowerCase()

      if (key === expectedKey) {
        konamiIndex++
        
        if (konamiIndex === KONAMI_CODE.length) {
          konamiIndex = 0
          onCodeActivated()
        }
      } else {
        konamiIndex = 0
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onCodeActivated])

  return null
}
