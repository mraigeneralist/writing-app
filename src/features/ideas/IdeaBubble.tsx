import { useEffect, useRef, useState } from 'react'
import { Archive, ArrowUpRight, MoreHorizontal } from 'lucide-react'
import { timeAgo } from '@/lib/format'
import type { Idea } from '@/lib/types'

interface Props {
  idea: Idea
  onPromote: (idea: Idea) => void
  onArchive: (idea: Idea) => void
}

export function IdeaBubble({ idea, onPromote, onArchive }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function onDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menuOpen])

  return (
    <div className="flex flex-col items-end">
      <div ref={ref} className="group relative flex max-w-[78%] items-start gap-1">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Idea actions"
          className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-input text-text-3 opacity-0 transition hover:bg-surface-2 group-hover:opacity-100 aria-expanded:opacity-100"
          aria-expanded={menuOpen}
        >
          <MoreHorizontal size={16} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-input border border-border bg-surface py-1 shadow-sm">
            <button
              onClick={() => {
                setMenuOpen(false)
                onPromote(idea)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-meta text-text hover:bg-surface-2"
            >
              <ArrowUpRight size={15} />
              promote to note
            </button>
            <button
              onClick={() => {
                setMenuOpen(false)
                onArchive(idea)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-meta text-text-2 hover:bg-surface-2"
            >
              <Archive size={15} />
              archive
            </button>
          </div>
        )}

        <div className="rounded-card bg-accent-soft px-3.5 py-2.5">
          <p className="whitespace-pre-wrap text-ui text-text">{idea.body}</p>
        </div>
      </div>
      <span className="mr-1 mt-1 text-[11px] text-text-3">
        {timeAgo(idea.created_at)}
      </span>
    </div>
  )
}
