import { Pencil, Trash2 } from 'lucide-react'
import { CategoryPill } from '@/features/categories/CategoryPill'
import type { Category, Note } from '@/lib/types'

interface Props {
  note: Note
  category?: Category
  onEdit: (note: Note) => void
  onDelete: (note: Note) => void
}

export function NoteCard({ note, category, onEdit, onDelete }: Props) {
  const source = [note.source_title, note.source_author, note.source_location]
    .filter(Boolean)
    .join(' · ')

  return (
    <article className="group flex flex-col gap-2.5 rounded-card border border-border bg-surface p-3.5">
      <div className="flex items-start justify-between gap-2">
        {category ? (
          <CategoryPill category={category} />
        ) : (
          <span className="text-meta text-text-3">uncategorized</span>
        )}
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
          <button
            onClick={() => onEdit(note)}
            aria-label="Edit note"
            className="inline-flex h-7 w-7 items-center justify-center rounded-input text-text-3 hover:bg-surface-2 hover:text-text"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(note)}
            aria-label="Delete note"
            className="inline-flex h-7 w-7 items-center justify-center rounded-input text-text-3 hover:bg-surface-2 hover:text-focus-warn"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <p className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-text line-clamp-[8]">
        {note.body}
      </p>

      {(source || note.tags.length > 0) && (
        <div className="mt-auto flex flex-col gap-1.5 pt-1">
          {source && <p className="text-meta text-text-3">{source}</p>}
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-pill bg-surface-2 px-2 py-0.5 text-[11px] text-text-2"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  )
}
