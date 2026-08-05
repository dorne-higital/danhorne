-- Run this against your Supabase (or Neon) Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0012_layout_settings.sql
-- or paste it into the Supabase SQL editor.
--
-- Layout picker (/admin/layout) — lets an admin choose the header nav and
-- footer arrangement from a fixed set of styles, without touching code.

alter table site_settings
	add column if not exists nav_style text not null default 'default' check (nav_style in ('default', 'centered')),
	add column if not exists footer_style text not null default 'default' check (footer_style in ('default', 'simple'));

-- The header has always fetched a menu with id 'main'; renamed to
-- 'header-main' so it lines up with the new 'footer-main'/'footer-legal'
-- menu ids the footer now looks for. No-op if this project never had a
-- 'main' menu, or already renamed it.
update menus set id = 'header-main' where id = 'main';
