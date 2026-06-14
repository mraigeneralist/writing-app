import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Document, TipTapDoc } from '@/lib/types'
import { tables } from './_tables'

export const documentKeys = {
  all: ['documents'] as const,
  detail: (id: string) => ['documents', id] as const,
}

export function useDocuments() {
  return useQuery({
    queryKey: documentKeys.all,
    queryFn: async () => {
      const rows = await tables.documents.list()
      // most recently edited first
      return rows.sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    },
  })
}

export function useDocument(id: string | undefined) {
  return useQuery({
    queryKey: documentKeys.detail(id ?? ''),
    enabled: Boolean(id),
    queryFn: async () => {
      const rows = await tables.documents.list()
      return rows.find((d) => d.id === id) ?? null
    },
  })
}

export function useCreateDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => {
      const now = new Date().toISOString()
      return tables.documents.insert({
        title: '',
        content: {} as TipTapDoc,
        category_id: null,
        word_count: 0,
        updated_at: now,
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: documentKeys.all }),
  })
}

export function useUpdateDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & Partial<Document>) =>
      tables.documents.update(id, {
        ...patch,
        updated_at: new Date().toISOString(),
      }),
    onSuccess: (doc) => {
      qc.invalidateQueries({ queryKey: documentKeys.all })
      qc.invalidateQueries({ queryKey: documentKeys.detail(doc.id) })
    },
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tables.documents.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: documentKeys.all }),
  })
}
