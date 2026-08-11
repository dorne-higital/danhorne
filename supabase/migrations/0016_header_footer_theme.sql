-- Run this against your Supabase (or Neon) Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0016_header_footer_theme.sql
-- or paste it into the Supabase SQL editor.
--
-- Layout picker (/admin/layout) — lets an admin set the header and footer
-- to the site's light or dark theme, or a solid "brand" theme (brand-primary
-- background, matching the existing --brand-* tokens already used by hero/
-- CTA blocks), independently of each other and of the rest of the page.

alter table site_settings
	add column if not exists header_theme text not null default 'light' check (header_theme in ('light', 'dark', 'brand')),
	add column if not exists footer_theme text not null default 'light' check (footer_theme in ('light', 'dark', 'brand'));
