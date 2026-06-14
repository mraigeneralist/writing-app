import { useMemo, useState } from 'react'
import { CornerDownLeft, Search, X } from 'lucide-react'
import type { Editor } from '@tiptap/react'
import { useNotes } from '@/lib/queries/notes'
import { useCategories } from '@/lib/queries/categories'
import { CategoryPill } from '@/features/categories/CategoryPill'
import type { Note } from '@/lib/types'
import { insertNote } from './editorConfig'

interface Props {
  editor: Editor | null
  open: boolean
  onClose: () => void
}

function matches(note: Note, q: string): boolean {
  if (!q) return true
  return [note.body, note.source_title, note.source_author, ...note.tags]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(q.toLowerCase())
}

// A drawer of the user's notes. Each has an insert action that drops the note
// into the document at the cursor as a sourced blockquote.
export function NotesSidebar({ editor, open, onClose }: Props) {
  const { data: notes = [] } = useNotes()
  const { data: categories = [] } = useCategories()
  const [q, setQ] = useState('')

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  )
  const filtered = useMemo(() => notes.filter((n) => matches(n, q)), [notes, q])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <aside className="relative z-10 flex h-full w-full max-w-sm flex-col border-l border-border bg-surface-2">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-sans text-section font-medium">notes</h2>
          <button
            onClick={onClose}
            aria-label="Close notes"
            className="inline-flex h-9 w-9 items-center justify-center rounded-input text-text-2 hover:bg-surface"
          >
            <X size={18} />
          </button>
        </header>

        <div className="relative px-4 py-3">
          <Search
            size={16}
            className="pointer-events-none absolute left-7 top-1/2 -translate-y-1/2 text-text-3"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search notes…"
            className="w-full rounded-input border border-border bg-surface py-2 pl-9 pr-3 text-ui text-text placeholder:text-text-3 focus-visible:ring-2 focus-visible:ring-accent/40"
          />
        </div>

        <div className="flex-1 space-y-2 overflow-auto px-4 pb-4">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-meta text-text-3">
              {notes.length === 0 ? 'no notes yet' : 'nothing matches'}
            </p>
          ) : (
            filtered.map((note) => {
              const cat = note.category_id
                ? categoryById.get(note.category_id)
                : undefined
              return (
                <div
                  key={note.id}
                  className="rounded-card border border-border bg-surface p-3"
                >
                  {cat && <CategoryPill category={cat} className="mb-1.5" />}
                  <p className="line-clamp-3 font-serif text-[14px] leading-relaxed text-text">
                    {note.body}
                  </p>
                  <button
                    onClick={() => editor && insertNote(editor, note)}
                    disabled={!editor}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-input px-2 py-1 text-meta text-accent hover:bg-accent-soft disabled:opacity-50"
                  >
                    <CornerDownLeft size={14} />
                    insert
                  </button>
                </div>
              )
            })
          )}
        </div>
      </aside>
    </div>
  )
}
