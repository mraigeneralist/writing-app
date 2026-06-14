import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/Button'
import { useCategories } from '@/lib/queries/categories'
import { useDeleteNote, useNotes } from '@/lib/queries/notes'
import type { Note } from '@/lib/types'
import { NoteCard } from './NoteCard'
import { NoteForm } from './NoteForm'
import { buildFilterOptions, FilterChips } from './FilterChips'

function matches(note: Note, q: string): boolean {
  if (!q) return true
  const haystack = [
    note.body,
    note.source_title,
    note.source_author,
    note.source_location,
    ...note.tags,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(q.toLowerCase())
}

export default function NotesBoard() {
  const { data: notes = [], isLoading } = useNotes()
  const { data: categories = [] } = useCategories()
  const deleteNote = useDeleteNote()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Note | null>(null)

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  )

  // Search first, then derive per-category counts, then apply the chip filter.
  const searched = useMemo(
    () => notes.filter((n) => matches(n, search)),
    [notes, search],
  )

  const counts = useMemo(() => {
    const map = new Map<string | null, number>()
    for (const n of searched)
      map.set(n.category_id, (map.get(n.category_id) ?? 0) + 1)
    return map
  }, [searched])

  const visible = useMemo(
    () =>
      filter === null
        ? searched
        : searched.filter((n) => n.category_id === filter),
    [searched, filter],
  )

  const options = buildFilterOptions(categories, counts, searched.length)

  function openNew() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(note: Note) {
    setEditing(note)
    setFormOpen(true)
  }

  function handleDelete(note: Note) {
    if (confirm('Delete this note?')) deleteNote.mutate(note.id)
  }

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-sans text-screen font-medium">notes</h1>
        <Button onClick={openNew}>
          <Plus size={18} />
          new note
        </Button>
      </header>

      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-3"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search notes…"
          className="w-full rounded-input border border-border bg-surface py-2 pl-9 pr-3 min-h-[44px] text-ui text-text placeholder:text-text-3 focus-visible:ring-2 focus-visible:ring-accent/40"
        />
      </div>

      {categories.length > 0 && (
        <FilterChips options={options} selected={filter} onSelect={setFilter} />
      )}

      {isLoading ? (
        <p className="text-ui text-text-3">loading…</p>
      ) : visible.length === 0 ? (
        <div className="rounded-card border border-dashed border-border p-10 text-center">
          <p className="text-ui text-text-2">
            {notes.length === 0
              ? 'no notes yet — capture what you learn in your own words.'
              : 'nothing matches your filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              category={
                note.category_id
                  ? categoryById.get(note.category_id)
                  : undefined
              }
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <NoteForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        note={editing}
      />
    </section>
  )
}
