-- Loom initial schema.
-- Every table is owned by a single user; RLS is the security boundary and is
-- enabled on every table with `auth.uid() = user_id` for all operations.
-- Created in dependency order: categories -> notes -> ideas -> documents.

-- ─────────────────────────────────────────────────────────────────────────────
-- categories
-- ─────────────────────────────────────────────────────────────────────────────
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  name        text not null,
  color       text not null
);

create index categories_user_id_idx on public.categories (user_id);

alter table public.categories enable row level security;

create policy categories_select on public.categories
  for select using (auth.uid() = user_id);
create policy categories_insert on public.categories
  for insert with check (auth.uid() = user_id);
create policy categories_update on public.categories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy categories_delete on public.categories
  for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- notes
-- ─────────────────────────────────────────────────────────────────────────────
create table public.notes (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  body             text not null,
  source_title     text,
  source_author    text,
  source_location  text,
  category_id      uuid references public.categories (id) on delete set null,
  tags             text[] not null default '{}'
);

create index notes_user_id_idx on public.notes (user_id);
create index notes_category_id_idx on public.notes (category_id);

alter table public.notes enable row level security;

create policy notes_select on public.notes
  for select using (auth.uid() = user_id);
create policy notes_insert on public.notes
  for insert with check (auth.uid() = user_id);
create policy notes_update on public.notes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy notes_delete on public.notes
  for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- ideas (references notes via promoted_note_id)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.ideas (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  created_at       timestamptz not null default now(),
  body             text not null,
  archived         boolean not null default false,
  promoted_note_id uuid references public.notes (id) on delete set null
);

create index ideas_user_id_idx on public.ideas (user_id);

alter table public.ideas enable row level security;

create policy ideas_select on public.ideas
  for select using (auth.uid() = user_id);
create policy ideas_insert on public.ideas
  for insert with check (auth.uid() = user_id);
create policy ideas_update on public.ideas
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy ideas_delete on public.ideas
  for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- documents
-- ─────────────────────────────────────────────────────────────────────────────
create table public.documents (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  title        text not null default '',
  content      jsonb not null default '{}'::jsonb,
  category_id  uuid references public.categories (id) on delete set null,
  word_count   integer not null default 0
);

create index documents_user_id_idx on public.documents (user_id);
create index documents_category_id_idx on public.documents (category_id);

alter table public.documents enable row level security;

create policy documents_select on public.documents
  for select using (auth.uid() = user_id);
create policy documents_insert on public.documents
  for insert with check (auth.uid() = user_id);
create policy documents_update on public.documents
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy documents_delete on public.documents
  for delete using (auth.uid() = user_id);
