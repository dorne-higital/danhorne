-- Run this against your Supabase (or Neon) Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0004_page_views.sql
-- or paste it into the Supabase SQL editor.
--
-- Backs first-party, self-hosted analytics — no third-party script, no
-- cookies. server/api/track.post.ts inserts a row per pageview (fired from
-- app/plugins/analytics.client.ts); server/api/analytics/summary.get.ts
-- aggregates them for the admin Analytics page.

create table if not exists page_views (
	id uuid primary key default gen_random_uuid(),
	path text not null,
	referrer text,
	-- sha256(ip + user-agent + date), truncated — approximates a unique
	-- visitor per day without ever storing a raw IP address.
	visitor_hash text not null,
	created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on page_views (created_at desc);
create index if not exists page_views_path_idx on page_views (path);

-- Same reasoning as every other table in 0001_init.sql: the app only ever
-- talks to this server-side via the service-role key (which bypasses RLS),
-- so this just closes the direct-API hole the public anon key would
-- otherwise have.
alter table page_views enable row level security;
