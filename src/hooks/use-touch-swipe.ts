import { useState, useCallback } from 'react'

  onTouchMove: (e: React.
}
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: () => void
}

export function useTouch
  onSwipeRight,
  onSwipeDown,
}: SwipeOptions): SwipeH
  const [touchEnd, setTouc
  const handleTouchS
 

  const handleTouchMove = useCa
    setTouchEn

    const de
    const absD

      if (deltaX > threshold && o
      } else if (deltaX < -threshold && onSwipeRight) {
      }

      } else if (deltaY < -threshold && onSwipeDown) {
      }
  }, [touchStart, touchEnd, threshold, onSwipeLeft, onSwi
  return {
    onTo

































