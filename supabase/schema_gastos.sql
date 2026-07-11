-- ============================================================
-- Bravonotes — Gastos universitarios (migración adicional)
-- Copia y pega esto en Supabase → SQL Editor → Run
-- (además del schema.sql que ya corriste antes, no lo reemplaza)
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Tabla: expenses (gastos registrados) ----------
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category text not null check (category in ('transporte','alimentacion','fotocopias','otros')),
  amount numeric(12,2) not null check (amount > 0),
  note text,
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

-- ---------- Tabla: budgets (presupuesto mensual) ----------
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  month text not null,              -- formato 'YYYY-MM'
  amount numeric(12,2) not null check (amount >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, month)
);

alter table public.expenses enable row level security;
alter table public.budgets  enable row level security;

create policy "expenses: solo el dueño" on public.expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "budgets: solo el dueño" on public.budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
