-- Run this against your Supabase (or Neon) Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0003_create_menus.sql
-- or paste it into the Supabase SQL editor. Reuses the set_updated_at()
-- function created in migration 0001.

create table if not exists menus (
	id text primary key,
	name text not null,
	items jsonb not null default '[]'::jsonb,
	updated_at timestamptz not null default now()
);

drop trigger if exists menus_set_updated_at on menus;

create trigger menus_set_updated_at
before update on menus
for each row
execute function set_updated_at();
