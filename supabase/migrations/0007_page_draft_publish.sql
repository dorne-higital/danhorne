-- Run this against your Supabase (or Neon) Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0007_page_draft_publish.sql
-- or paste it into the Supabase SQL editor.
--
-- Draft/publish state, plus a per-page secret token so a draft can be
-- shared via a preview link without needing a CMS login. New pages default
-- to 'draft'; existing pages are explicitly backfilled to 'published' below
-- so nothing already live goes dark when this column is added.

alter table pages
	add column if not exists status text not null default 'draft' check (status in ('draft', 'published')),
	add column if not exists preview_token uuid not null default gen_random_uuid();

update pages set status = 'published' where status = 'draft';
