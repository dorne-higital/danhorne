-- Run this against your Supabase (or Neon) Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0011_site_settings_recaptcha.sql
-- or paste it into the Supabase SQL editor.
--
-- reCAPTCHA v3 integration (/admin/integrations). recaptcha_secret_key is
-- never sent to the browser — server/api/settings/index.get.ts only ever
-- returns whether one is set, not its value. recaptcha_site_key is public
-- (it's meant to be embedded in the page, same as GTM's container id).

alter table site_settings
	add column if not exists recaptcha_site_key text,
	add column if not exists recaptcha_secret_key text,
	add column if not exists recaptcha_enabled boolean not null default false;
