import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface Props {
  value: string[]
  onChange: (tags: string[]) => void
}

// Type a tag and press Enter or comma to add it; Backspace on an empty field
// removes the last one. Tags render as neutral chips.
export function TagsInput({ value, onChange }: Props) {
  const [draft, setDraft] = useState('')

  function add(raw: string) {
    const tag = raw.trim().replace(/,$/, '')
    if (tag && !value.includes(tag)) onChange([...value, tag])
    setDraft('')
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(draft)
    } else if (e.key === 'Backspace' && draft === '' && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-input border border-border bg-surface px-2 py-1.5 min-h-[44px] focus-within:ring-2 focus-within:ring-accent/40">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-pill bg-surface-2 px-2 py-0.5 text-meta text-text-2"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            aria-label={`Remove ${tag}`}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => add(draft)}
        placeholder={value.length ? '' : 'add tags…'}
        className="flex-1 bg-transparent px-1 py-1 text-ui text-text placeholder:text-text-3 focus-visible:ring-0"
      />
    </div>
  )
}
