import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { TextField } from '@/components/TextField'
import { CategoryCombobox } from '@/features/categories/CategoryCombobox'
import {
  useCreateNote,
  useUpdateNote,
  type NoteInput,
} from '@/lib/queries/notes'
import type { Note } from '@/lib/types'
import { TagsInput } from './TagsInput'

interface Props {
  open: boolean
  onClose: () => void
  note?: Note | null
  initialBody?: string
  onSaved?: (note: Note) => void
}

export function NoteForm({ open, onClose, note, initialBody, onSaved }: Props) {
  const createNote = useCreateNote()
  const updateNote = useUpdateNote()

  const [body, setBody] = useState('')
  const [sourceTitle, setSourceTitle] = useState('')
  const [sourceAuthor, setSourceAuthor] = useState('')
  const [sourceLocation, setSourceLocation] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])

  // Seed the form whenever it opens.
  useEffect(() => {
    if (!open) return
    setBody(note?.body ?? initialBody ?? '')
    setSourceTitle(note?.source_title ?? '')
    setSourceAuthor(note?.source_author ?? '')
    setSourceLocation(note?.source_location ?? '')
    setCategoryId(note?.category_id ?? null)
    setTags(note?.tags ?? [])
  }, [open, note, initialBody])

  const busy = createNote.isPending || updateNote.isPending

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!body.trim()) return

    const input: NoteInput = {
      body: body.trim(),
      source_title: sourceTitle.trim() || null,
      source_author: sourceAuthor.trim() || null,
      source_location: sourceLocation.trim() || null,
      category_id: categoryId,
      tags,
    }

    const saved = note
      ? await updateNote.mutateAsync({ id: note.id, ...input })
      : await createNote.mutateAsync(input)

    onSaved?.(saved)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={note ? 'edit note' : 'new note'}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <textarea
          autoFocus
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="in your own words…"
          rows={5}
          className="w-full resize-y rounded-input border border-border bg-surface p-3 font-serif text-prose text-text placeholder:text-text-3 focus-visible:ring-2 focus-visible:ring-accent/40"
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <TextField
            label="source title"
            placeholder="book / article"
            value={sourceTitle}
            onChange={(e) => setSourceTitle(e.target.value)}
          />
          <TextField
            label="author"
            value={sourceAuthor}
            onChange={(e) => setSourceAuthor(e.target.value)}
          />
          <TextField
            label="location"
            placeholder="page / ch."
            value={sourceLocation}
            onChange={(e) => setSourceLocation(e.target.value)}
          />
        </div>

        <div>
          <span className="mb-2 block text-meta text-text-2">category</span>
          <CategoryCombobox value={categoryId} onChange={setCategoryId} />
        </div>

        <div>
          <span className="mb-2 block text-meta text-text-2">tags</span>
          <TagsInput value={tags} onChange={setTags} />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            cancel
          </Button>
          <Button type="submit" disabled={busy || !body.trim()}>
            {busy ? 'saving…' : 'save note'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
