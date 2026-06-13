# Loom

A personal **capture → organize → create** app. Text ideas to yourself, refine
what you learn into categorized notes, and turn that material into written
content — all in one calm, writerly tool.

See [`AGENTS.md`](./AGENTS.md) for product scope and engineering conventions, and
[`DESIGN.md`](./DESIGN.md) for the visual system.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · React Router · TanStack Query ·
Supabase (Postgres + Auth + RLS) · TipTap · vite-plugin-pwa. All free tier.
**No AI features.**

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase URL + anon key
npm run dev
```

### Supabase setup

1. Create a free project at [supabase.com](https://supabase.com).
2. **Settings → API** → copy the **Project URL** and **anon public key** into
   `.env.local` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Run the migration in `supabase/migrations/` via the SQL Editor (or
   `npx supabase db push`).
4. **Authentication → URL Configuration** → add `http://localhost:5173` to the
   redirect URLs.

## Scripts

| Command             | Description                               |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Local dev server                          |
| `npm run build`     | Production build (`tsc -b && vite build`) |
| `npm run preview`   | Preview the production build              |
| `npm run lint`      | ESLint                                    |
| `npm run typecheck` | `tsc --noEmit`                            |

`lint`, `typecheck`, and `build` must all pass before a task is "done".
