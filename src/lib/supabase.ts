import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// When env vars are absent the app runs in "local mode": auth is bypassed and
// data is persisted to localStorage (see lib/local-table.ts). This lets us build
// and test every feature before wiring a real Supabase project.
export const isSupabaseConfigured = Boolean(url && anonKey)

// The single Supabase client, or null in local mode. Components never import
// this directly — data access goes through the TanStack Query hooks in
// lib/queries/.
export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null
