-- Run this against your Supabase (or Neon) Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0005_page_view_details.sql
-- or paste it into the Supabase SQL editor.
--
-- Adds a few more (still privacy-light) dimensions to page_views so the
-- admin Analytics page can break traffic down by referrer, device type,
-- browser and country — on top of the existing path/day totals from
-- 0004_page_views.sql.
--
-- device_type/browser are derived from the request's user-agent header at
-- track time (server/utils/parseUserAgent.ts) — the raw user-agent string
-- itself is never stored, only these two coarse categories.
--
-- country is read from a geolocation header some hosts inject on incoming
-- requests (Vercel/Netlify/Cloudflare — see server/utils/geoCountry.ts). No
-- IP-geolocation lookup or third-party service is called; on a host that
-- doesn't provide one of those headers this column just stays null.

alter table page_views
	add column if not exists device_type text,
	add column if not exists browser text,
	add column if not exists country text;
