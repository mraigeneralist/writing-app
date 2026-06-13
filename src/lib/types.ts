// Row shapes for the Supabase tables (see supabase/migrations/0001_init.sql).
// Hand-written rather than generated to keep the toolchain free-tier-only.

export interface Category {
  id: string
  user_id: string
  created_at: string
  name: string
  color: string
}

export interface Note {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  body: string
  source_title: string | null
  source_author: string | null
  source_location: string | null
  category_id: string | null
  tags: string[]
}

export interface Idea {
  id: string
  user_id: string
  created_at: string
  body: string
  archived: boolean
  promoted_note_id: string | null
}

// TipTap stores a ProseMirror document as JSON; we keep it opaque here.
export type TipTapDoc = Record<string, unknown>

export interface Document {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  title: string
  content: TipTapDoc
  category_id: string | null
  word_count: number
}
