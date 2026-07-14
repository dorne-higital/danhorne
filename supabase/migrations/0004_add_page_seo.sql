-- Run this against your Supabase (or Neon) Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0004_add_page_seo.sql
-- or paste it into the Supabase SQL editor.

alter table pages add column if not exists seo jsonb;
