import { useState, useEffect } from 'react'

  speed: number = 30,
) {
  const [isComplete, 
  useEffect(() => {
   
    if (!text) {
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    setDisplayedText('')
    setIsComplete(false)

    if (!text) {
      setIsComplete(true)
          se
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










