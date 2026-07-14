-- Run this against your Supabase Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0007_create_site_settings.sql
-- or paste it into the Supabase SQL editor. Reuses the set_updated_at()
-- function created in migration 0001.

create table if not exists site_settings (
	id text primary key default 'default',
	primary_color text not null,
	secondary_color text not null,
	accent_color text not null,
	background_color text not null,
	site_name text not null,
	favicon_url text,
	company jsonb,
	updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_set_updated_at on site_settings;

create trigger site_settings_set_updated_at
before update on site_settings
for each row
execute function set_updated_at();

-- Single settings row, seeded with today's hardcoded values so the table is
-- never empty and the app never has to handle a "no settings yet" state.
insert into site_settings (id, primary_color, secondary_color, accent_color, background_color, site_name)
values ('default', '#e63946', '#457b9d', '#a8dadc', '#f1ede3', 'Dan Horne')
on conflict (id) do nothing;
