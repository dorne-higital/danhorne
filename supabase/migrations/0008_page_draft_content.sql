-- Run this against your Supabase (or Neon) Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0008_page_draft_content.sql
-- or paste it into the Supabase SQL editor.
--
-- Splits page content into a "live" copy (title/blocks — what the public
-- site renders) and a "draft" copy (draft_title/draft_blocks — what the
-- editor edits and the Preview button shows). Saving a page no longer
-- publishes it; only POST /api/pages/:slug/publish copies draft -> live.
-- Backfilled from the existing live columns so every page starts with an
-- identical, unpublished-changes-free draft.

alter table pages
	add column if not exists draft_title text,
	add column if not exists draft_blocks jsonb;

update pages set draft_title = title, draft_blocks = blocks where draft_title is null;

alter table pages
	alter column draft_title set not null,
	alter column draft_blocks set not null;
