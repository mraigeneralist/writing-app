import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Mic, SendHorizontal } from 'lucide-react'

interface Props {
  onSend: (body: string) => void
}

// Frictionless capture: a single input pinned to the bottom. The mic is a
// placeholder affordance for future voice capture (not wired up).
export function CaptureInput({ onSend }: Props) {
  const [value, setValue] = useState('')

  function submit(e?: FormEvent) {
    e?.preventDefault()
    const body = value.trim()
    if (!body) return
    onSend(body)
    setValue('')
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex items-end gap-2 rounded-card border border-border bg-surface p-2"
    >
      <button
        type="button"
        aria-label="Voice capture (coming soon)"
        title="Voice capture (coming soon)"
        disabled
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-input text-text-3"
      >
        <Mic size={20} />
      </button>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        placeholder="text an idea to yourself…"
        className="max-h-32 flex-1 resize-none bg-transparent py-2 text-ui text-text placeholder:text-text-3 focus-visible:ring-0"
      />
      <button
        type="submit"
        aria-label="Send"
        disabled={!value.trim()}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-input bg-accent text-bg transition active:scale-95 disabled:opacity-40"
      >
        <SendHorizontal size={18} />
      </button>
    </form>
  )
}
