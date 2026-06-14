import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tables } from './_tables'

export const ideaKeys = {
  all: ['ideas'] as const,
}

export function useIdeas() {
  return useQuery({
    queryKey: ideaKeys.all,
    queryFn: async () => {
      const rows = await tables.ideas.list()
      // chat order: oldest first, newest at the bottom; hide archived
      return rows
        .filter((i) => !i.archived)
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
    },
  })
}

export function useCreateIdea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: string) => tables.ideas.insert({ body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ideaKeys.all }),
  })
}

export function useArchiveIdea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tables.ideas.update(id, { archived: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ideaKeys.all }),
  })
}

// Link an idea to the note it became and remove it from the stream.
export function usePromoteIdea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, noteId }: { id: string; noteId: string }) =>
      tables.ideas.update(id, { archived: true, promoted_note_id: noteId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ideaKeys.all }),
  })
}
