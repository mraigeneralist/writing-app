import { useCallback, useEffect, useRef, useState } from 'react'

const IDLE_MS = 3000

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// The fade duration must match the CSS transition on .focus-text.is-fading.
export function fadeDurationMs(): number {
  return prefersReducedMotion() ? 600 : 2400
}

interface Params {
  durationSec: number
  onErase: () => void
  onTimeUp: () => void
}

interface FocusTimers {
  remaining: number
  fading: boolean
  start: () => void
  stop: () => void
  /** Call on every keystroke: cancels any fade and resets the idle timer. */
  onActivity: () => void
}

// Drives the "most dangerous writing app" mechanic with two timers:
//   idle (3s of no typing) → start fade; then fade-duration → erase.
// Both are cleared on every input event. A separate 1s interval counts the
// sprint down; at zero the mechanic stops and surviving text is revealed.
export function useFocusTimers({
  durationSec,
  onErase,
  onTimeUp,
}: Params): FocusTimers {
  const [remaining, setRemaining] = useState(durationSec)
  const [fading, setFading] = useState(false)

  const idleRef = useRef<number>()
  const fadeRef = useRef<number>()
  const tickRef = useRef<number>()
  const running = useRef(false)

  // Keep latest callbacks without re-creating the timer functions.
  const onEraseRef = useRef(onErase)
  const onTimeUpRef = useRef(onTimeUp)
  onEraseRef.current = onErase
  onTimeUpRef.current = onTimeUp

  const clearFadeTimers = useCallback(() => {
    window.clearTimeout(idleRef.current)
    window.clearTimeout(fadeRef.current)
  }, [])

  const scheduleIdle = useCallback(() => {
    clearFadeTimers()
    idleRef.current = window.setTimeout(() => {
      setFading(true)
      fadeRef.current = window.setTimeout(() => {
        onEraseRef.current()
        setFading(false)
      }, fadeDurationMs())
    }, IDLE_MS)
  }, [clearFadeTimers])

  const stop = useCallback(() => {
    running.current = false
    clearFadeTimers()
    window.clearInterval(tickRef.current)
    setFading(false)
  }, [clearFadeTimers])

  const onActivity = useCallback(() => {
    if (!running.current) return
    setFading(false) // snap opacity back instantly (no transition when not fading)
    scheduleIdle()
  }, [scheduleIdle])

  const start = useCallback(() => {
    running.current = true
    setRemaining(durationSec)
    setFading(false)
    scheduleIdle()
    tickRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          stop()
          onTimeUpRef.current()
          return 0
        }
        return r - 1
      })
    }, 1000)
  }, [durationSec, scheduleIdle, stop])

  useEffect(() => stop, [stop])

  return { remaining, fading, start, stop, onActivity }
}
