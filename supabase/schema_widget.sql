-- ============================================================
-- Bravonotes — Preferencias de usuario (widget de inicio)
-- Copia y pega esto en Supabase → SQL Editor → Run
-- (además de los otros scripts que ya corriste, no los reemplaza)
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists public.user_prefs (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  widget text not null default 'clases' check (widget in ('clases','tareas','gastos','apuntes')),
  updated_at timestamptz not null default now()
);

alter table public.user_prefs enable row level security;

create policy "user_prefs: solo el dueño" on public.user_prefs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
