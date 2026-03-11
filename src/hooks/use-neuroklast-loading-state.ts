import { useEffect, useState, useRef } from 'react'

const HACKING_TEXTS = [
  '> INITIALIZING NEURAL INTERFACE...',
  '> LOADING CORE MODULES...',
  '> ESTABLISHING SECURE LINK...',
  '> DECRYPTING DATASTREAM...',
  '> COMPILING AUDIO ENGINE...',
  '> SYNCING FREQUENCY MATRIX...',
  '> ACTIVATING HUD OVERLAY...',
  '> LOADING VISUAL CORTEX...',
  '> PROCESSING SIGNAL CHAIN...',
  '> CALIBRATING BPM RESONANCE...',
  '> FINALIZING BOOT SEQUENCE...',
  '> SYSTEM ONLINE // ACCESS GRANTED',
]

const CODE_FRAGMENTS = [
  'fn init_neural() -> Result<()> {',
  '  let freq = 150.0_f64;',
  '  signal::process(bpm);',
  '  audio.connect(output)?;',
  '  hud.render(frame)?;',
  'const NK = 0xFF2222;',
  'mov eax, [neuro+0x1A]',
  'jmp 0xDEADBEEF',
  'syscall.exec("init")',
  '  decrypt(stream, key);',
  'KERNEL: audio_engine [OK]',
  'SUBSYS: hud_display [OK]',
  'NODE: freq_matrix v2.0.1',
  'HASH: 0xA3F7B2C1D8E9',
  '00110101 01001110 01001011',
  'export NK_MODE=ACTIVATED',
]

export function useNeuroklastLoadingState(onComplete?: () => void) {
  const [progress, setProgress] = useState(0)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); return 100 }
        return Math.min(prev + 2, 100)
      })
    }, 50)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => {
        if (onCompleteRef.current) {
          onCompleteRef.current()
        }
      }, 500)
      return () => clearTimeout(t)
    }
  }, [progress])

  const hackingText = HACKING_TEXTS[Math.min(
    Math.floor(progress / 100 * HACKING_TEXTS.length),
    HACKING_TEXTS.length - 1,
  )]
  const codeFragment = CODE_FRAGMENTS[Math.floor(progress / 100 * CODE_FRAGMENTS.length) % CODE_FRAGMENTS.length]

  return { progress, hackingText, codeFragment, CODE_FRAGMENTS }
}
