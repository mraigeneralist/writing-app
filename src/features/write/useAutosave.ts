import { useEffect, useRef } from 'react'

interface Options {
  delay?: number
  enabled?: boolean
}

// Debounced autosave. `trigger` should change whenever the saved content does
// (e.g. a revision counter combined with title/category). The first run after
// mount is skipped so loading a document doesn't immediately re-save it.
export function useAutosave(
  trigger: unknown,
  save: () => void,
  { delay = 800, enabled = true }: Options = {},
) {
  const saveRef = useRef(save)
  saveRef.current = save
  const first = useRef(true)

  useEffect(() => {
    if (!enabled) return
    if (first.current) {
      first.current = false
      return
    }
    const t = setTimeout(() => saveRef.current(), delay)
    return () => clearTimeout(t)
  }, [trigger, enabled, delay])
}
