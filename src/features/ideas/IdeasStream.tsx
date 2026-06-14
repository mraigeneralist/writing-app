import { useEffect, useRef, useState } from 'react'
import {
  useArchiveIdea,
  useCreateIdea,
  useIdeas,
  usePromoteIdea,
} from '@/lib/queries/ideas'
import { NoteForm } from '@/features/notes/NoteForm'
import type { Idea, Note } from '@/lib/types'
import { IdeaBubble } from './IdeaBubble'
import { CaptureInput } from './CaptureInput'

export default function IdeasStream() {
  const { data: ideas = [], isLoading } = useIdeas()
  const createIdea = useCreateIdea()
  const archiveIdea = useArchiveIdea()
  const promoteIdea = usePromoteIdea()

  const [promoting, setPromoting] = useState<Idea | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Keep the newest message in view.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [ideas.length])

  function handleArchive(idea: Idea) {
    archiveIdea.mutate(idea.id)
  }

  function handlePromoted(note: Note) {
    if (promoting) promoteIdea.mutate({ id: promoting.id, noteId: note.id })
    setPromoting(null)
  }

  return (
    <section className="flex min-h-[calc(100dvh-9rem)] flex-col md:min-h-[calc(100dvh-5rem)]">
      <h1 className="mb-3 font-sans text-screen font-medium">ideas</h1>

      <div className="flex flex-1 flex-col justify-end gap-2 overflow-y-auto">
        {isLoading ? (
          <p className="text-ui text-text-3">loading…</p>
        ) : ideas.length === 0 ? (
          <p className="py-10 text-center text-ui text-text-3">
            no ideas yet — text the first one to yourself below.
          </p>
        ) : (
          ideas.map((idea) => (
            <IdeaBubble
              key={idea.id}
              idea={idea}
              onPromote={setPromoting}
              onArchive={handleArchive}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="pt-3">
        <CaptureInput onSend={(body) => createIdea.mutate(body)} />
      </div>

      <NoteForm
        open={promoting !== null}
        onClose={() => setPromoting(null)}
        initialBody={promoting?.body}
        onSaved={handlePromoted}
      />
    </section>
  )
}
