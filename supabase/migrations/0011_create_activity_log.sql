-- Run this against your Supabase Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0011_create_activity_log.sql
-- or paste it into the Supabase SQL editor.

create table if not exists activity_log (
	id uuid primary key default gen_random_uuid(),
	entity_type text not null,
	entity_id text not null,
	action text not null check (action in ('created', 'updated', 'deleted')),
	summary text not null,
	actor_id uuid references profiles (id) on delete set null,
	created_at timestamptz not null default now()
);

create index if not exists activity_log_created_at_idx on activity_log (created_at desc);

-- Only ever accessed server-side via the service-role client (see
-- supabase/migrations/0010_enable_rls.sql for why every table gets this).
alter table activity_log enable row level security;
