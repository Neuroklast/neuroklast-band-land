import { useEffect, useState } from 'react'

const SIGNAL_STATES = [
  '[SIGNAL_DETECTED]',
  '[TRANSMISSION_ACTIVE]',
  '[CARRIER_WAVE_LOCKED]',
  '[FREQUENCY_SYNC]',
  '[NEURAL_LINK_ESTABLISHED]'
]

export function useGlitchNoirHeroState() {
  const [glitchActive, setGlitchActive] = useState(false)
  const [signalText, setSignalText] = useState(SIGNAL_STATES[0])

  useEffect(() => {
    const textInterval = setInterval(() => {
      setSignalText(SIGNAL_STATES[Math.floor(Math.random() * SIGNAL_STATES.length)])
    }, 3500)

    return () => clearInterval(textInterval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        setGlitchActive(true)
        setTimeout(() => setGlitchActive(false), Math.random() * 150 + 50)
      }
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return { glitchActive, signalText }
}
