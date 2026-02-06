import { useState, useCallback } from 'react'

  onSwipeRight?: () => v
  onSwipeDown?: () => void
}
interface SwipeHandlers 
  onTouchMove: (e: React.T
}
e

  onSwipeDown,
}: SwipeOptions): SwipeHandlers {
  const [touchEnd, setTouchEnd] = useState<{
  const handleTouchStart
 

export function useTouchSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 75,
}: SwipeOptions): SwipeHandlers {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })


  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return

    const deltaX = touchStart.x - touchEnd.x
    const deltaY = touchStart.y - touchEnd.y
}
    const absDeltaY = Math.abs(deltaY)

    if (absDeltaX > absDeltaY) {
      if (deltaX > threshold && onSwipeLeft) {
        onSwipeLeft()

        onSwipeRight()

    } else {
      if (deltaY > threshold && onSwipeUp) {
        onSwipeUp()
      } else if (deltaY < -threshold && onSwipeDown) {
        onSwipeDown()

    }
  }, [touchStart, touchEnd, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,

}
