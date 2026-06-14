import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/Button'
import { useFocusTimers } from './useFocusTimers'

interface Props {
  open: boolean
  onClose: () => void
  /** Append the surviving sprint text into the current document. */
  onSave: (text: string) => void
}

const DURATIONS = [3, 5, 10, 15, 20] // minutes
const ACK_KEY = 'loom.focusAck'

type Phase = 'start' | 'running' | 'done'

function mmss(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function FocusMode({ open, onClose, onSave }: Props) {
  const [phase, setPhase] = useState<Phase>('start')
  const [durationMin, setDurationMin] = useState(5)
  const [text, setText] = useState('')
  const [acked, setAcked] = useState(
    () => localStorage.getItem(ACK_KEY) === '1',
  )
  const [confirming, setConfirming] = useState<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const timers = useFocusTimers({
    durationSec: durationMin * 60,
    onErase: () => setText(''),
    onTimeUp: () => setPhase('done'),
  })

  // Reset to the start screen each time the overlay opens.
  useEffect(() => {
    if (open) {
      setPhase('start')
      setText('')
      setConfirming(null)
    }
  }, [open])

  // Start/stop the sprint when entering/leaving the running phase.
  useEffect(() => {
    if (phase !== 'running') return
    timers.start()
    textareaRef.current?.focus()
    return () => timers.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  if (!open) return null

  function pick(min: number) {
    if (!acked) {
      setConfirming(min)
      return
    }
    setDurationMin(min)
    setPhase('running')
  }

  function confirmStart() {
    localStorage.setItem(ACK_KEY, '1')
    setAcked(true)
    if (confirming != null) {
      setDurationMin(confirming)
      setPhase('running')
    }
    setConfirming(null)
  }

  function activity() {
    timers.onActivity()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg">
      {/* Start screen */}
      {phase === 'start' && (
        <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 text-center">
          <button
            onClick={onClose}
            aria-label="Exit focus mode"
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-input text-text-2 hover:bg-surface-2"
          >
            <X size={20} />
          </button>

          <h2 className="font-sans text-screen font-medium">focus sprint</h2>

          {confirming == null ? (
            <>
              <p className="mt-3 text-ui text-text-2">
                pick a duration. if you stop typing for 3 seconds, your text
                fades and is{' '}
                <span className="text-focus-warn">erased</span>.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {DURATIONS.map((min) => (
                  <button
                    key={min}
                    onClick={() => pick(min)}
                    className="rounded-input border border-border px-5 py-3 text-ui text-text transition hover:bg-surface-2"
                  >
                    {min} min
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-card border border-focus-warn/40 bg-surface p-5">
              <p className="text-ui text-text">
                once you start, pausing for 3 seconds fades your writing away and{' '}
                <strong className="text-focus-warn">clears it</strong>. there is
                no undo — that is the point.
              </p>
              <div className="mt-5 flex justify-center gap-2">
                <Button variant="secondary" onClick={() => setConfirming(null)}>
                  cancel
                </Button>
                <Button onClick={confirmStart}>
                  i understand — start {confirming} min
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Running */}
      {phase === 'running' && (
        <>
          <div className="flex items-center justify-between px-6 py-4">
            <span
              className="font-sans text-section tabular-nums"
              style={{ color: 'rgb(var(--focus-warn))' }}
            >
              {mmss(timers.remaining)}
            </span>
            <button
              onClick={() => {
                timers.stop()
                setPhase('done')
              }}
              className="rounded-input px-3 py-1.5 text-meta text-text-2 hover:bg-surface-2"
            >
              end sprint
            </button>
          </div>

          <div className="relative flex flex-1 justify-center overflow-hidden px-6 pb-10">
            <div
              className={
                'focus-text w-full max-w-[680px]' +
                (timers.fading ? ' is-fading' : '')
              }
            >
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                  activity()
                }}
                onKeyDown={activity}
                placeholder="write. don't stop."
                className="h-full w-full resize-none bg-transparent font-serif text-focus leading-relaxed text-text placeholder:text-text-3 focus-visible:ring-0"
              />
            </div>

            {timers.fading && (
              <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-meta text-focus-warn">
                keep typing — your words are fading
              </p>
            )}
          </div>
        </>
      )}

      {/* Done */}
      {phase === 'done' && (
        <div className="mx-auto flex min-h-full w-full max-w-[680px] flex-col justify-center px-6 py-12">
          <h2 className="font-sans text-screen font-medium">sprint over</h2>
          {text.trim() ? (
            <>
              <p className="mt-2 text-ui text-text-2">
                what survived:
              </p>
              <div className="mt-4 max-h-[50vh] overflow-auto whitespace-pre-wrap rounded-card border border-border bg-surface p-5 font-serif text-prose text-text">
                {text}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose}>
                  discard
                </Button>
                <Button
                  onClick={() => {
                    onSave(text)
                    onClose()
                  }}
                >
                  save to document
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 text-ui text-text-2">
                nothing survived this time — the words faded away.
              </p>
              <div className="mt-6 flex justify-end">
                <Button onClick={onClose}>close</Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
