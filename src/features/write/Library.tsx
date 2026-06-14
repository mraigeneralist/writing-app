import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/Button'
import { CategoryPill } from '@/features/categories/CategoryPill'
import { useCategories } from '@/lib/queries/categories'
import {
  useCreateDocument,
  useDeleteDocument,
  useDocuments,
} from '@/lib/queries/documents'
import { timeAgo } from '@/lib/format'
import { documentText } from './editorConfig'

export default function Library() {
  const { data: docs = [], isLoading } = useDocuments()
  const { data: categories = [] } = useCategories()
  const createDoc = useCreateDocument()
  const deleteDoc = useDeleteDocument()
  const navigate = useNavigate()

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  )

  async function onNew() {
    const doc = await createDoc.mutateAsync()
    navigate(`/write/${doc.id}`)
  }

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-sans text-screen font-medium">write</h1>
        <Button onClick={onNew} disabled={createDoc.isPending}>
          <Plus size={18} />
          new document
        </Button>
      </header>

      {isLoading ? (
        <p className="text-ui text-text-3">loading…</p>
      ) : docs.length === 0 ? (
        <div className="rounded-card border border-dashed border-border p-10 text-center">
          <p className="text-ui text-text-2">
            no documents yet — start writing from your notes.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
          {docs.map((doc) => {
            const snippet = documentText(doc.content)
            const cat = doc.category_id
              ? categoryById.get(doc.category_id)
              : undefined
            return (
              <li key={doc.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/write/${doc.id}`)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && navigate(`/write/${doc.id}`)
                  }
                  className="group flex cursor-pointer items-start gap-3 px-4 py-3.5 transition hover:bg-surface-2"
                >
                  <FileText
                    size={18}
                    className="mt-0.5 shrink-0 text-text-3"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-sans text-ui font-medium text-text">
                        {doc.title.trim() || 'Untitled'}
                      </span>
                      {cat && <CategoryPill category={cat} />}
                    </div>
                    {snippet && (
                      <p className="mt-0.5 line-clamp-1 text-meta text-text-2">
                        {snippet}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-text-3">
                      {doc.word_count} words · edited {timeAgo(doc.updated_at)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Delete this document?'))
                        deleteDoc.mutate(doc.id)
                    }}
                    aria-label="Delete document"
                    className="shrink-0 rounded-input p-1.5 text-text-3 opacity-0 transition hover:bg-surface hover:text-focus-warn group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
