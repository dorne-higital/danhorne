-- Run this against your Supabase (or Neon) Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0006_page_revisions.sql
-- or paste it into the Supabase SQL editor.
--
-- Per-page revision history — a snapshot of a page's content is written
-- every time it's created, saved, duplicated, or restored, so an editor
-- can undo a bad save without needing a full site backup. Trimmed to the
-- last 10 per page (server/utils/pageRevisions.ts), so this table stays
-- small regardless of how long a page has existed.

create table if not exists page_revisions (
	id uuid primary key default gen_random_uuid(),
	page_id text not null references pages (id) on delete cascade,
	title text not null,
	slug text not null,
	blocks jsonb not null default '[]'::jsonb,
	seo jsonb,
	actor_id uuid references profiles (id) on delete set null,
	created_at timestamptz not null default now()
);

create index if not exists page_revisions_page_id_idx on page_revisions (page_id, created_at desc);

alter table page_revisions enable row level security;
