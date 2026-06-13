# AGENTS.md

## Project: Loom (working name — rename freely)

A personal **knowledge-to-content** app. The user captures ideas, refines what
they learn into categorized notes, and turns that material into written content
(articles, scripts, social posts). One mental model runs through everything:

> **capture → organize → create**

This file is the source of truth for product scope and engineering conventions.
Read `DESIGN.md` before building any UI.

> Note: Claude Code reads `CLAUDE.md`, not `AGENTS.md`. The repo root contains a
> one-line `CLAUDE.md` that imports this file (`@AGENTS.md`). Keep the rules here.

---

## What we're building (v1 scope)

- **Ideas** — a chat-style stream where the user "texts ideas to themselves."
  Frictionless capture: newest at the bottom, no title or category required.
- **Notes** — the user rewrites what they learn **in their own words**, attaches
  a **source** (book / author / location), and assigns **one category**.
  Displayed as a **card board**, filterable by category, full-text searchable.
- **Write** — a distraction-light rich-text editor (TipTap) with the user's
  notes docked in a sidebar to reference and insert. Documents are also
  categorized and shown in a library.
- **Focus mode** — a toggle inside the editor. If the user stops typing for
  3 seconds, the text fades over ~2.4s and is cleared. Timer presets: 3, 5, 10,
  15, 20 minutes. (Squibler-style "most dangerous writing app".)
- **Idea → note promotion** — an idea can be promoted to a note in one action.
  That promotion is the moment the category picker appears.

## Explicitly OUT of scope for v1 — do not add these

- **No AI features of any kind.** No generation, summarization, or LLM calls.
- No collaboration, sharing, or real-time multiuser.
- No payments / billing.

Keep it simple. Single-user accounts via Supabase Auth, architected so it can
become a multi-user product later.

---

## Tech stack (all free tiers)

- React 18 + TypeScript + **Vite**
- **Tailwind CSS** — tokens defined in `DESIGN.md`
- **React Router** — routing
- **TanStack Query** (server state) + **Supabase JS client** (data)
- **TipTap** — editor + focus mode
- **Supabase** (Postgres, Auth, Row Level Security) — free tier
- **vite-plugin-pwa** — installable on phone + desktop
- Hosting: **Vercel** — free tier

## Commands

- `npm run dev` — local dev server
- `npm run build` — production build (**must pass before any task is "done"**)
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
- `npx supabase ...` — Supabase CLI for migrations (see `/supabase`)

Always run `lint`, `typecheck`, and `build` before declaring a task complete.

---

## Project structure (target)

```
src/
  app/            # router, providers, layout shell, bottom nav
  features/
    ideas/        # stream UI, capture input, promote-to-note
    notes/        # card board, note form, category combobox
    write/        # documents library, TipTap editor, notes sidebar, focus mode
    categories/   # category CRUD, color picker
    auth/         # sign in / sign up
  lib/
    supabase.ts   # client
    queries/      # TanStack Query hooks, one file per entity
  components/     # shared UI primitives
  styles/         # tailwind config + tokens from DESIGN.md
supabase/
  migrations/     # SQL schema + RLS policies
```

## Data model (Supabase Postgres)

Every table has: `id uuid pk default gen_random_uuid()`,
`user_id uuid not null references auth.users`,
`created_at timestamptz not null default now()`.
**RLS is enabled on every table** with `user_id = auth.uid()` for all of
select / insert / update / delete.

- `categories` — `name text`, `color text` (hex from the DESIGN.md palette)
- `ideas` — `body text`, `archived bool default false`,
  `promoted_note_id uuid null references notes(id)`
- `notes` — `body text` (own words), `source_title text`, `source_author text`,
  `source_location text`, `category_id uuid references categories(id)`,
  `tags text[] default '{}'`, `updated_at timestamptz`
- `documents` — `title text`, `content jsonb` (TipTap doc JSON),
  `category_id uuid references categories(id)`, `word_count int default 0`,
  `updated_at timestamptz`

## Product rules that matter

- **Categories are first-class objects** (name + color), not free-text strings.
  The same category renders the same color everywhere — note-card pill, filter
  chip, and picker all match.
- **Category picker is a combobox**, never a fixed dropdown: typing filters
  existing categories; if nothing matches, offer "create '<typed text>'" inline.
- **Capture has zero required fields** beyond the body. Organizing happens later
  (at promotion, or in the note form).
- **Focus mode is one document**, not a separate screen — a normal draft and a
  fading sprint share the same editor and content.
- Both **notes and documents are categorizable**. Keep them neatly organized:
  notes as cards, documents as a library list.
- **Mobile and desktop are equal.** Every layout must work at ~380px and at
  desktop widths. Mobile uses a bottom nav.

## Conventions

- TypeScript strict mode. No `any` without a justifying comment.
- Functional components + hooks. One component per file.
- **Data access only through TanStack Query hooks in `lib/queries/`** —
  components never call the Supabase client directly.
- Style with Tailwind using the design tokens; no magic hex values in JSX.
  Read `DESIGN.md` before building UI.
- Keep secrets out of the client. Only the Supabase **anon** key (public by
  design) and project URL belong in `.env` as `VITE_` vars.
  **RLS is the security boundary — never disable it.**

## Workflow

- Use **plan mode** for anything touching the schema, auth, or more than ~2
  files. Show the plan before writing code.
- Small, reviewable commits, one per feature slice.
- When a migration changes the schema, update the query hooks and types in the
  same change.