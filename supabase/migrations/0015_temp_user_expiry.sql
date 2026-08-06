-- Run this against your Supabase (or Neon) Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0015_temp_user_expiry.sql
-- or paste it into the Supabase SQL editor.
--
-- Temporary user access (/admin/users) — an admin can create a time-boxed
-- account (e.g. for a QA contractor) that loses access automatically once
-- expires_at passes, no manual cleanup required.

alter table profiles
	add column if not exists expires_at timestamptz;
