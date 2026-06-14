import { localTable } from '@/lib/local-table'
import type { Category, Note, Idea, Document } from '@/lib/types'

// The single place query hooks get their data access. Today these are
// localStorage-backed (local mode). When Supabase is wired, swap each entry for
// a Supabase-backed implementation of the same LocalTable interface — the query
// hooks won't change.
export const tables = {
  categories: localTable<Category>('categories'),
  notes: localTable<Note>('notes'),
  ideas: localTable<Idea>('ideas'),
  documents: localTable<Document>('documents'),
}
