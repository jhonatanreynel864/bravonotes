-- ============================================================
-- Bravonotes — Vestuario de la mascota (moños y gorros)
-- Copia y pega esto en Supabase → SQL Editor → Run
-- ============================================================

alter table public.user_prefs
  add column if not exists equipped_accessory text;
