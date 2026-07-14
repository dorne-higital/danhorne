-- Run this against your Supabase Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0009_add_page_parent.sql
-- or paste it into the Supabase SQL editor.

alter table pages add column if not exists parent_id text references pages (id) on delete set null;
create index if not exists pages_parent_id_idx on pages (parent_id);
