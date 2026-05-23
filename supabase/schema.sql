-- Writeflow database schema
-- Run this in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run

-- Quick captured ideas
create table if not exists ideas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  content     text not null,
  created_at  timestamptz default now()
);

-- Full notes (Tiptap document stored as JSON)
create table if not exists notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  title       text,
  content     jsonb,
  updated_at  timestamptz default now(),
  created_at  timestamptz default now()
);

-- Row-Level Security: each user can only see and edit their own rows
alter table ideas enable row level security;
alter table notes enable row level security;

drop policy if exists "own ideas" on ideas;
drop policy if exists "own notes" on notes;

create policy "own ideas" on ideas for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own notes" on notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Helpful indexes
create index if not exists ideas_user_created_idx on ideas (user_id, created_at desc);
create index if not exists notes_user_updated_idx on notes (user_id, updated_at desc);
