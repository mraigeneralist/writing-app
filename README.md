# Writeflow

A Notion-style mobile writing app for Android with three core features:

1. **Idea capture** — quick frictionless notes.
2. **Danger Mode** — timed writing session. Stop typing for 3 seconds and your text fades to nothing. Inspired by *The Most Dangerous Writing App*.
3. **Notion-style editor** for longer drafts, with cloud sync.

Built with **React Native + Expo**, **TypeScript**, **Expo Router**, **Tiptap** (`@10play/tentap-editor`), and **Supabase** (Postgres + Auth).

---

## Getting started

### Prerequisites
- Node.js 20+ (`node --version`)
- Git (`git --version`)
- Free accounts: [Supabase](https://supabase.com), [Expo](https://expo.dev)
- **Expo Go** app on your Android phone (Play Store)

### Setup

```powershell
git clone https://github.com/mraigeneralist/writing-app.git
cd writing-app
npm install
copy .env.example .env
# then fill in Supabase URL + anon key in .env
```

### Set up Supabase

1. Create a new project at https://supabase.com (free tier).
2. Open **SQL Editor** -> paste contents of [`supabase/schema.sql`](supabase/schema.sql) -> Run.
3. **Project Settings -> API** -> copy `Project URL` and `anon public` key into your `.env`.
4. **Authentication -> Providers** -> make sure **Email** is enabled.

### Run on your phone

```powershell
npx expo start
```

Scan the QR code with Expo Go.

---

## Project structure

```
src/
  app/                 # Expo Router screens (file-based routing)
  components/          # Reusable components
  constants/theme.ts   # Colors, spacing, fonts
  hooks/
  lib/supabase.ts      # Supabase client
supabase/
  schema.sql           # Database schema (run once in Supabase SQL editor)
```

## Build status

Currently in **Phase 1** - project scaffolded, dependencies installed. Next: auth screens, then home screen, then the editor, then Danger Mode.

See the implementation plan for the full roadmap.
