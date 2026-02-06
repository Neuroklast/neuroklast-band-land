import { useState, useEffect } from 'react'

export function useTypingEffect(
  text: string,
  speed: number = 30,
  startDelay: number = 0
) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    setDisplayedText('')
    setIsComplete(false)

    if (!text) {
      setIsComplete(true)
      return
    }

    const startTimeout = setTimeout(() => {
      let currentIndex = 0

      const intervalId = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1))
          currentIndex++
        } else {
          clearInterval(intervalId)
          setIsComplete(true)
        }
      }, speed)

      return () => clearInterval(intervalId)
    }, startDelay)

    return () => clearTimeout(startTimeout)
  }, [text, speed, startDelay])

  return { displayedText, isComplete }
}
