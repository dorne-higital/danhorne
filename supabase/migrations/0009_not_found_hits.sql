-- Run this against your Supabase (or Neon) Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0009_not_found_hits.sql
-- or paste it into the Supabase SQL editor.
--
-- Logs real 404s (server/api/track-404.post.ts, fired from
-- app/pages/[...slug].vue right after the redirects table already came up
-- empty) so /admin/redirects can surface "someone hit /old-page 6 times,
-- want to redirect it?" instead of dead links just silently happening.

create table if not exists not_found_hits (
	id uuid primary key default gen_random_uuid(),
	path text not null unique,
	hit_count integer not null default 1,
	first_seen_at timestamptz not null default now(),
	last_seen_at timestamptz not null default now()
);

create index if not exists not_found_hits_hit_count_idx on not_found_hits (hit_count desc);

alter table not_found_hits enable row level security;
