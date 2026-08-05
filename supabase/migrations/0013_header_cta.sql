-- Run this against your Supabase (or Neon) Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0013_header_cta.sql
-- or paste it into the Supabase SQL editor.
--
-- Header CTA (/admin/layout) — the "Say hello" button was previously always
-- shown, always opened the contact modal, and always said "Say hello".
-- Makes it optional and configurable: on/off, custom label, and either the
-- contact modal or a plain link.

alter table site_settings
	add column if not exists header_cta_enabled boolean not null default true,
	add column if not exists header_cta_label text not null default 'Say hello',
	add column if not exists header_cta_action text not null default 'modal' check (header_cta_action in ('modal', 'link')),
	add column if not exists header_cta_url text;
