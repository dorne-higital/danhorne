-- Run this against your Supabase (or Neon) Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0003_redirects.sql
-- or paste it into the Supabase SQL editor.
--
-- Backs the auto-redirect-on-rename feature (AUDIT.md #6) — when a page's
-- slug changes, server/api/pages/[slug].put.ts writes a row here so a
-- visitor hitting the old URL gets a 301 to the new one instead of a 404,
-- checked in app/pages/[...slug].vue.

create table if not exists redirects (
	old_slug text primary key,
	new_slug text not null,
	created_at timestamptz not null default now()
);

-- Same reasoning as every other table in 0001_init.sql: the app only ever
-- talks to this server-side via the service-role key (which bypasses RLS),
-- so this just closes the direct-API hole the public anon key would
-- otherwise have.
alter table redirects enable row level security;
