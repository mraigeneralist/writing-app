import {
  Bold,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  Quote,
  type LucideIcon,
} from 'lucide-react'
import type { Editor } from '@tiptap/react'

interface Props {
  editor: Editor
}

function Tool({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={
        'inline-flex h-9 w-9 items-center justify-center rounded-input transition ' +
        (active ? 'bg-accent-soft text-accent' : 'text-text-2 hover:bg-surface-2')
      }
    >
      <Icon size={18} />
    </button>
  )
}

export function Toolbar({ editor }: Props) {
  function toggleLink() {
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Link URL', prev ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-input border border-border bg-surface p-1">
      <Tool
        icon={Bold}
        label="bold"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <Tool
        icon={Italic}
        label="italic"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <Tool
        icon={Heading2}
        label="heading"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <Tool
        icon={List}
        label="bullet list"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <Tool
        icon={Quote}
        label="quote"
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />
      <Tool
        icon={LinkIcon}
        label="link"
        active={editor.isActive('link')}
        onClick={toggleLink}
      />
    </div>
  )
}
