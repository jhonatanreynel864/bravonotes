-- ============================================================
-- Bravonotes — Notificaciones push reales
-- Copia y pega esto en Supabase → SQL Editor → Run
-- ============================================================

create extension if not exists "pgcrypto";

-- Guarda la "suscripción" de cada dispositivo que activó notificaciones
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

create policy "push_subscriptions: solo el dueño" on public.push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Evita mandar el mismo aviso dos veces el mismo día
-- (solo la función del servidor toca esta tabla, por eso no tiene políticas
-- para usuarios normales — queda bloqueada para el cliente)
create table if not exists public.notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  ref_type text not null,      -- 'clase' | 'tarea'
  ref_id uuid not null,
  notif_date date not null,
  created_at timestamptz not null default now(),
  unique (ref_type, ref_id, notif_date)
);

alter table public.notification_log enable row level security;
