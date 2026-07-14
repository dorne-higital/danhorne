-- Run this against your Supabase Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0008_drop_favicon.sql
-- or paste it into the Supabase SQL editor.

alter table site_settings drop column if exists favicon_url;
