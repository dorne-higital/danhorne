-- Run this against your Supabase (or Neon) Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0010_site_settings_gtm.sql
-- or paste it into the Supabase SQL editor.
--
-- Optional Google Tag Manager integration (/admin/integrations). When
-- gtm_enabled is true and gtm_id is set, app.vue injects the GTM snippet
-- and the built-in first-party pageview tracker (server/api/track.post.ts,
-- app/plugins/analytics.client.ts) stops firing, so nothing double-counts.

alter table site_settings
	add column if not exists gtm_id text,
	add column if not exists gtm_enabled boolean not null default false;
