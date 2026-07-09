-- ============================================================
-- Bravonotes — esquema de Supabase
-- Copia y pega todo este archivo en Supabase → SQL Editor → Run
-- ============================================================

-- Necesario para generar UUIDs
create extension if not exists "pgcrypto";

-- ---------- Tabla: schedule (clases de la semana) ----------
create table if not exists public.schedule (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  subject text not null,
  day int not null,               -- 0 = Lunes ... 6 = Domingo
  time text not null,             -- "08:00"
  color text not null default 'purple',
  has_pending boolean not null default false,
  pending_text text,
  created_at timestamptz not null default now()
);

-- ---------- Tabla: tasks (tareas pendientes) ----------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  due_date date,
  day int,                        -- opcional: día de clase asociado
  created_at timestamptz not null default now()
);

-- ---------- Tabla: notes (notas de texto) ----------
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  content text,
  created_at timestamptz not null default now()
);

-- ---------- Tabla: apuntes (texto, fotos o documentos) ----------
create table if not exists public.apuntes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  type text not null check (type in ('text','image','document')),
  content text,                   -- solo si type = 'text'
  file_path text,                 -- solo si type = 'image' | 'document' (ruta en Storage)
  file_name text,
  file_size int,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security: cada quien solo ve y edita lo suyo
-- ============================================================
alter table public.schedule enable row level security;
alter table public.tasks    enable row level security;
alter table public.notes    enable row level security;
alter table public.apuntes  enable row level security;

create policy "schedule: solo el dueño" on public.schedule
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tasks: solo el dueño" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "notes: solo el dueño" on public.notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "apuntes: solo el dueño" on public.apuntes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Storage: bucket privado para fotos y documentos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('apuntes-files', 'apuntes-files', false)
on conflict (id) do nothing;

-- Cada usuario solo puede leer/escribir dentro de una carpeta con su propio uid:
-- ej. archivo guardado como  {user_id}/1699999999-apunte.pdf
create policy "apuntes-files: solo el dueño (lectura)" on storage.objects
  for select using (bucket_id = 'apuntes-files' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "apuntes-files: solo el dueño (subida)" on storage.objects
  for insert with check (bucket_id = 'apuntes-files' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "apuntes-files: solo el dueño (borrado)" on storage.objects
  for delete using (bucket_id = 'apuntes-files' and auth.uid()::text = (storage.foldername(name))[1]);
