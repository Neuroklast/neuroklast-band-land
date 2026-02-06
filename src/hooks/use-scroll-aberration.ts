import { useEffect, useState } from 'react'

  const [aberrationIntensity, setAberra
  useEffect(() => {
    let lastScrollY = window.scrollY

      const current
      const timeDelta
    let lastScrollY = window.scrollY
    let lastTime = Date.now()

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const currentTime = Date.now()
      const timeDelta = Math.max(currentTime - lastTime, 1)
      const scrollDelta = Math.abs(currentScrollY - lastScrollY)
      const scrollVelocity = scrollDelta / timeDelta * 100

      lastScrollY = currentScrollY
      lastTime = currentTime

      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        setScrollY(currentScrollY)
        const intensity = Math.min(scrollVelocity / 10, 1)
        setAberrationIntensity(intensity)

    }

    const decayAberration = () => {

        if (prev <= 0.01) return 0
















