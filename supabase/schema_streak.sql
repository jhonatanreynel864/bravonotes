-- ============================================================
-- Bravonotes — Racha de tareas (opcional)
-- Copia y pega esto en Supabase → SQL Editor → Run
-- ============================================================

create extension if not exists "pgcrypto";

-- Un registro por cada día en que el usuario completó al menos una tarea
create table if not exists public.streak_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  activity_date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, activity_date)
);

alter table public.streak_log enable row level security;

create policy "streak_log: solo el dueño" on public.streak_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Bandera para activar/desactivar la racha (se guarda en la misma tabla
-- de preferencias que ya existe para el widget)
alter table public.user_prefs
  add column if not exists streak_enabled boolean not null default false;
