-- ============================================================
-- Bravonotes — esquema base de Supabase
-- (Ya lo corriste antes — este archivo es solo de referencia)
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists public.schedule (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  subject text not null,
  day int not null,
  time text not null,
  color text not null default 'purple',
  has_pending boolean not null default false,
  pending_text text,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  due_date date,
  day int,
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  content text,
  created_at timestamptz not null default now()
);

create table if not exists public.apuntes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  type text not null check (type in ('text','image','document')),
  content text,
  file_path text,
  file_name text,
  file_size int,
  created_at timestamptz not null default now()
);

alter table public.schedule enable row level security;
alter table public.tasks    enable row level security;
alter table public.notes    enable row level security;
alter table public.apuntes  enable row level security;

create policy "schedule: solo el dueño" on public.schedule for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks: solo el dueño" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notes: solo el dueño" on public.notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "apuntes: solo el dueño" on public.apuntes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public) values ('apuntes-files', 'apuntes-files', false) on conflict (id) do nothing;

create policy "apuntes-files: solo el dueño (lectura)" on storage.objects for select using (bucket_id = 'apuntes-files' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "apuntes-files: solo el dueño (subida)" on storage.objects for insert with check (bucket_id = 'apuntes-files' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "apuntes-files: solo el dueño (borrado)" on storage.objects for delete using (bucket_id = 'apuntes-files' and auth.uid()::text = (storage.foldername(name))[1]);
