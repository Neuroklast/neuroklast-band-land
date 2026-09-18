import { useCallback, useEffect, useRef, useState } from 'react'
import {
  applyLatchRelease,
  applyLatchToward,
  createLatchState,
  pointerToTrackProgress,
  tickLatchCoast,
  type LatchState,
} from '@/lib/latch-physics'

export function useLatchSlider({
  granted,
  onGranted,
  reducedMotion,
  pad = 28,
}: {
  granted: boolean
  onGranted: () => void
  reducedMotion: boolean
  pad?: number
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<LatchState>(createLatchState)
  const stateRef = useRef(state)
  const lastXRef = useRef(0)
  const lastTRef = useRef(0)
  const grantedRef = useRef(granted)
  const draggingRef = useRef(false)
  const [dragging, setDragging] = useState(false)
  const [keyDriving, setKeyDriving] = useState(false)

  useEffect(() => {
    grantedRef.current = granted
  }, [granted])

  const commit = useCallback(
    (next: LatchState) => {
      stateRef.current = next
      setState(next)
      if (next.latch === 'sealed' && !grantedRef.current) {
        onGranted()
      }
    },
    [onGranted],
  )

  const chasePointer = useCallback(
    (clientX: number, dtMs: number) => {
      const track = trackRef.current?.getBoundingClientRect()
      const target = pointerToTrackProgress(
        clientX,
        (track?.left ?? 0) + pad,
        Math.max(1, (track?.width ?? 360) - pad * 2),
      )
      commit(applyLatchToward(stateRef.current, target, dtMs))
    },
    [commit, pad],
  )

  const beginDrag = useCallback((clientX: number, pointerId?: number, target?: HTMLElement) => {
    if (grantedRef.current) return
    draggingRef.current = true
    lastXRef.current = clientX
    lastTRef.current = performance.now()
    stateRef.current = { ...stateRef.current, dragging: true }
    setDragging(true)
    if (pointerId !== undefined && target?.setPointerCapture) {
      try {
        target.setPointerCapture(pointerId)
      } catch {
        // jsdom may not implement capture
      }
    }
  }, [])

  useEffect(() => {
    if (granted || (!dragging && !keyDriving && state.progress <= 0) || state.latch === 'sealed') return
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(32, now - last)
      last = now
      const current = stateRef.current
      if (grantedRef.current || current.latch === 'sealed') return
      if (keyDriving) {
        commit(applyLatchToward(current, 1, dt))
        frame = window.requestAnimationFrame(tick)
        return
      }
      if (draggingRef.current) {
        chasePointer(lastXRef.current, dt)
        frame = window.requestAnimationFrame(tick)
        return
      }
      if (current.progress > 0) {
        const next = tickLatchCoast(current, dt)
        commit(next)
        if (next.progress > 0 && next.latch !== 'sealed') {
          frame = window.requestAnimationFrame(tick)
        }
      }
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [chasePointer, commit, dragging, granted, keyDriving, state.latch, state.progress])

  useEffect(() => {
    if (!dragging) return

    const onMove = (event: PointerEvent) => {
      if (!draggingRef.current) return
      const now = performance.now()
      const dt = Math.max(1, now - lastTRef.current)
      lastXRef.current = event.clientX
      lastTRef.current = now
      chasePointer(event.clientX, dt)
    }

    const onUp = () => {
      draggingRef.current = false
      setDragging(false)
      commit(applyLatchRelease(stateRef.current))
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [chasePointer, commit, dragging])

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (grantedRef.current) return
      if (event.key === 'ArrowRight' || event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        if (reducedMotion) {
          onGranted()
          return
        }
        setKeyDriving(true)
      }
    },
    [onGranted, reducedMotion],
  )

  const onKeyUp = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowRight' || event.key === ' ' || event.key === 'Enter') {
      setKeyDriving(false)
      commit(applyLatchRelease(stateRef.current))
    }
  }, [commit])

  const onClick = useCallback(() => {
    if (reducedMotion && !grantedRef.current) onGranted()
  }, [onGranted, reducedMotion])

  const onPointerDownTrack = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      event.preventDefault()
      beginDrag(event.clientX, event.pointerId, event.currentTarget)
    },
    [beginDrag],
  )

  const onPointerDownHandle = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      event.stopPropagation()
      event.preventDefault()
      beginDrag(event.clientX, event.pointerId, event.currentTarget)
    },
    [beginDrag],
  )

  return {
    state,
    trackRef,
    dragging,
    beginDrag,
    onKeyDown,
    onKeyUp,
    onClick,
    onPointerDownTrack,
    onPointerDownHandle,
    progress: state.progress,
    pct: Math.round(state.progress * 100),
  }
}
