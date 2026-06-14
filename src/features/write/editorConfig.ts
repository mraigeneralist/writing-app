import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import type { Editor } from '@tiptap/react'
import type { Note } from '@/lib/types'

export const editorExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
  }),
  Link.configure({
    openOnClick: false,
    autolink: true,
    HTMLAttributes: { rel: 'noopener noreferrer nofollow' },
  }),
  Placeholder.configure({
    placeholder: 'Start writing…',
  }),
]

export function wordCount(text: string): number {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

// Flatten a stored TipTap document to plain text (for snippets / word counts
// without mounting an editor).
export function documentText(content: unknown): string {
  function walk(node: unknown): string {
    if (!node || typeof node !== 'object') return ''
    const n = node as { type?: string; text?: string; content?: unknown[] }
    if (n.type === 'text') return n.text ?? ''
    return (n.content ?? []).map(walk).join(' ')
  }
  return walk(content).replace(/\s+/g, ' ').trim()
}

// Insert a note at the cursor as a blockquote, with its source on an italic line.
export function insertNote(editor: Editor, note: Note): void {
  const source = [note.source_title, note.source_author, note.source_location]
    .filter(Boolean)
    .join(' · ')

  const content: Record<string, unknown>[] = [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: note.body }],
    },
  ]
  if (source) {
    content.push({
      type: 'paragraph',
      content: [{ type: 'text', marks: [{ type: 'italic' }], text: `— ${source}` }],
    })
  }

  editor
    .chain()
    .focus()
    .insertContent([
      { type: 'blockquote', content },
      { type: 'paragraph' },
    ])
    .run()
}
