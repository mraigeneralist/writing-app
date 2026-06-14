import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Note } from '@/lib/types'
import { tables } from './_tables'

export const noteKeys = {
  all: ['notes'] as const,
}

export type NoteInput = {
  body: string
  source_title?: string | null
  source_author?: string | null
  source_location?: string | null
  category_id?: string | null
  tags?: string[]
}

export function useNotes() {
  return useQuery({
    queryKey: noteKeys.all,
    queryFn: async () => {
      const rows = await tables.notes.list()
      // newest first
      return rows.sort((a, b) => b.created_at.localeCompare(a.created_at))
    },
  })
}

export function useCreateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: NoteInput) => {
      const now = new Date().toISOString()
      return tables.notes.insert({
        body: input.body,
        source_title: input.source_title ?? null,
        source_author: input.source_author ?? null,
        source_location: input.source_location ?? null,
        category_id: input.category_id ?? null,
        tags: input.tags ?? [],
        updated_at: now,
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: noteKeys.all }),
  })
}

export function useUpdateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & Partial<Note>) =>
      tables.notes.update(id, {
        ...patch,
        updated_at: new Date().toISOString(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: noteKeys.all }),
  })
}

export function useDeleteNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tables.notes.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: noteKeys.all }),
  })
}
