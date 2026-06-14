import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, PanelRightOpen } from 'lucide-react'
import { EditorContent, useEditor } from '@tiptap/react'
import { useDocument, useUpdateDocument } from '@/lib/queries/documents'
import { CategoryCombobox } from '@/features/categories/CategoryCombobox'
import type { TipTapDoc } from '@/lib/types'
import { editorExtensions, wordCount } from './editorConfig'
import { Toolbar } from './Toolbar'
import { NotesSidebar } from './NotesSidebar'
import { useAutosave } from './useAutosave'

export default function Editor() {
  const { id } = useParams()
  const { data: doc, isLoading } = useDocument(id)
  const updateDoc = useUpdateDocument()

  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [rev, setRev] = useState(0)
  const [words, setWords] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const ready = useRef(false)

  const editor = useEditor({
    extensions: editorExtensions,
    editorProps: {
      attributes: { class: 'tiptap focus:outline-none' },
    },
    onUpdate: () => setRev((r) => r + 1),
  })

  // Load the document into the editor once (no update event so autosave waits).
  useEffect(() => {
    if (!editor || !doc || ready.current) return
    setTitle(doc.title)
    setCategoryId(doc.category_id)
    const hasContent = doc.content && Object.keys(doc.content).length > 0
    editor.commands.setContent(hasContent ? doc.content : '', false)
    setWords(wordCount(editor.getText()))
    ready.current = true
  }, [editor, doc])

  useAutosave(
    `${rev}|${title}|${categoryId}`,
    () => {
      if (!editor || !id) return
      const text = editor.getText()
      const count = wordCount(text)
      setWords(count)
      updateDoc.mutate({
        id,
        title,
        category_id: categoryId,
        content: editor.getJSON() as TipTapDoc,
        word_count: count,
      })
    },
    { enabled: ready.current },
  )

  if (isLoading) {
    return <p className="text-ui text-text-3">loading…</p>
  }
  if (!doc) {
    return (
      <div className="text-center">
        <p className="text-ui text-text-2">document not found.</p>
        <Link to="/write" className="mt-2 inline-block text-ui text-accent">
          back to library
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/write"
          className="inline-flex items-center gap-1.5 text-meta text-text-2 hover:text-text"
        >
          <ArrowLeft size={16} />
          library
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-meta text-text-3">{words} words</span>
          <button
            onClick={() => setSidebarOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-input border border-border px-3 py-1.5 text-meta text-text-2 hover:bg-surface-2"
          >
            <PanelRightOpen size={16} />
            notes
          </button>
        </div>
      </div>

      {/* Writing sheet */}
      <div className="mx-auto w-full max-w-[680px] rounded-card border border-border bg-surface px-6 py-8 sm:px-10">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="w-full bg-transparent font-serif text-[28px] font-medium text-text placeholder:text-text-3 focus-visible:ring-0"
        />

        <div className="mt-3 max-w-xs">
          <CategoryCombobox value={categoryId} onChange={setCategoryId} />
        </div>

        {editor && (
          <div className="sticky top-2 z-10 mt-5">
            <Toolbar editor={editor} />
          </div>
        )}

        <div className="mt-4">
          <EditorContent editor={editor} />
        </div>
      </div>

      <NotesSidebar
        editor={editor}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  )
}
