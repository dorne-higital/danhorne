-- Run this against your Supabase (or Neon) Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0001_create_pages.sql
-- or paste it into the Supabase SQL editor.

create table if not exists pages (
	id text primary key,
	slug text not null unique,
	title text not null,
	blocks jsonb not null default '[]'::jsonb,
	updated_at timestamptz not null default now()
);

create index if not exists pages_slug_idx on pages (slug);

create or replace function set_updated_at()
returns trigger as $$
begin
	new.updated_at = now();
	return new;
end;
$$ language plpgsql;

drop trigger if exists pages_set_updated_at on pages;

create trigger pages_set_updated_at
before update on pages
for each row
execute function set_updated_at();
