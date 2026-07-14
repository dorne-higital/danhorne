-- Run this against your Supabase Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0010_enable_rls.sql
-- or paste it into the Supabase SQL editor.
--
-- These tables had no Row Level Security enabled, which means the public
-- anon key (shipped to every browser for Supabase Auth to work) could hit
-- Supabase's auto-generated REST API directly and read/write them,
-- completely bypassing this app's own admin auth checks. The app only ever
-- talks to these tables server-side via the service-role key, which always
-- bypasses RLS regardless of policies — so enabling RLS with zero policies
-- here just closes that direct-API hole. No app behavior changes.

alter table pages enable row level security;
alter table uploads enable row level security;
alter table menus enable row level security;
alter table site_settings enable row level security;
