-- Run this against your fresh Supabase (or Neon) Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
-- or paste it into the Supabase SQL editor. Neon has no Storage product —
-- the bucket insert below is Supabase-only; swap in your own file storage
-- if you're on Neon.
--
-- Single init migration for a template repo — this is the full schema for a
-- brand new project, not an incremental history. Every table has RLS
-- enabled with zero policies: the app only ever talks to these tables
-- server-side via the service-role key (which always bypasses RLS), so
-- this just closes the direct-API hole that the public anon key (shipped
-- to every browser for Supabase Auth) would otherwise have via Supabase's
-- auto-generated REST API.

create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger as $$
begin
	new.updated_at = now();
	return new;
end;
$$ language plpgsql;

-- ─── Profiles (Supabase Auth) ────────────────────────────────────────────
-- Relies on Supabase Auth (auth.users), which exists by default on every
-- Supabase project. Created before Pages below, since pages.updated_by
-- references this table (not auth.users directly) so PostgREST can embed
-- the updater's name in one query, e.g. .select('*, updater:profiles(name)')
-- — there's no PostgREST-visible FK path from pages straight to auth.users.

create table if not exists profiles (
	id uuid primary key references auth.users (id) on delete cascade,
	first_name text,
	last_name text,
	nickname text,
	role text not null default 'user' check (role in ('admin', 'user')),
	created_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "Users can read own profile" on profiles;
create policy "Users can read own profile" on profiles
	for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles
	for update using (auth.uid() = id);

-- Auto-create a profile row for every new auth user (invited or otherwise),
-- deriving first/last name from invite metadata (or leaving them null for
-- the dashboard-created first account) and seeding the nickname from
-- initials. The very first user ever created becomes admin automatically;
-- everyone after that defaults to 'user'. This is how the first admin
-- account gets bootstrapped without needing an open public signup page.
create or replace function public.handle_new_user()
returns trigger as $$
declare
	is_first boolean;
	fname text;
	lname text;
begin
	select count(*) = 0 into is_first from public.profiles;
	fname := nullif(new.raw_user_meta_data ->> 'first_name', '');
	lname := nullif(new.raw_user_meta_data ->> 'last_name', '');
	insert into public.profiles (id, first_name, last_name, nickname, role)
	values (
		new.id,
		fname,
		lname,
		nullif(upper(coalesce(left(fname, 1), '') || coalesce(left(lname, 1), '')), ''),
		case when is_first then 'admin' else 'user' end
	);
	return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
	after insert on auth.users
	for each row execute function public.handle_new_user();

-- ─── Pages ─────────────────────────────────────────────────────────────────

create table if not exists pages (
	id text primary key,
	slug text not null unique,
	title text not null,
	blocks jsonb not null default '[]'::jsonb,
	seo jsonb,
	parent_id text references pages (id) on delete set null,
	updated_by uuid references profiles (id) on delete set null,
	updated_at timestamptz not null default now()
);

create index if not exists pages_slug_idx on pages (slug);
create index if not exists pages_parent_id_idx on pages (parent_id);

drop trigger if exists pages_set_updated_at on pages;
create trigger pages_set_updated_at
before update on pages
for each row
execute function set_updated_at();

alter table pages enable row level security;

-- ─── Uploads ───────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

create table if not exists uploads (
	id uuid primary key default gen_random_uuid(),
	filename text not null,
	path text not null,
	url text not null,
	size bigint,
	mime_type text,
	created_at timestamptz not null default now()
);

create index if not exists uploads_created_at_idx on uploads (created_at desc);

alter table uploads enable row level security;

-- ─── Menus ─────────────────────────────────────────────────────────────────

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

alter table menus enable row level security;

-- ─── Forms ─────────────────────────────────────────────────────────────────
-- Created before Site settings below, since site_settings.contact_form_id
-- references this table (points at whichever form powers the "Say hello"
-- modal — see the seed at the bottom of this file).

create table if not exists forms (
	id uuid primary key default gen_random_uuid(),
	name text not null,
	fields jsonb not null default '[]'::jsonb,
	submit_label text not null default 'Send message',
	success_message text not null default 'Thanks — we''ll be in touch soon.',
	updated_at timestamptz not null default now()
);

drop trigger if exists forms_set_updated_at on forms;
create trigger forms_set_updated_at
before update on forms
for each row
execute function set_updated_at();

alter table forms enable row level security;

-- Seeded default "Contact" form, mirroring the site's original hardcoded
-- contact form fields exactly — so a fresh clone still has a working "Say
-- hello" modal out of the box, editable from /admin/forms immediately after.
-- Fixed id so site_settings.contact_form_id below can point at it directly.
insert into forms (id, name, fields, submit_label, success_message)
values (
	'00000000-0000-0000-0000-000000000001',
	'Contact',
	'[
		{"id":"field-first-name","name":"firstName","label":"First name","type":"text","required":true,"width":"half"},
		{"id":"field-last-name","name":"lastName","label":"Last name","type":"text","required":true,"width":"half"},
		{"id":"field-email","name":"email","label":"Email","type":"email","required":true,"width":"half"},
		{"id":"field-phone","name":"phone","label":"Phone","type":"tel","required":false,"width":"half","hint":"Optional"},
		{"id":"field-subject","name":"subject","label":"Subject","type":"select","required":true,"width":"half","options":[{"label":"General enquiry","value":"general"},{"label":"New project","value":"project"},{"label":"Something else","value":"other"}]},
		{"id":"field-message","name":"message","label":"Message","type":"textarea","required":true,"width":"full"}
	]'::jsonb,
	'Send message',
	'Thanks — we''ll get back to you within a day or two.'
)
on conflict (id) do nothing;

-- ─── Site settings ─────────────────────────────────────────────────────────

create table if not exists site_settings (
	id text primary key default 'default',
	primary_color text not null,
	secondary_color text not null,
	accent_color text not null,
	background_color text not null,
	site_name text not null,
	logo_url text,
	contact_form_id uuid references forms (id) on delete set null,
	company jsonb,
	socials jsonb,
	updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_set_updated_at on site_settings;
create trigger site_settings_set_updated_at
before update on site_settings
for each row
execute function set_updated_at();

-- Single settings row, seeded with the starting palette so the table is
-- never empty and the app never has to handle a "no settings yet" state —
-- change all of this from /admin/settings once the site's live.
insert into site_settings (id, primary_color, secondary_color, accent_color, background_color, site_name, contact_form_id)
values ('default', '#e63946', '#457b9d', '#a8dadc', '#f1ede3', 'My Site', '00000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

alter table site_settings enable row level security;

-- ─── Activity log ──────────────────────────────────────────────────────────

create table if not exists activity_log (
	id uuid primary key default gen_random_uuid(),
	entity_type text not null,
	entity_id text not null,
	action text not null check (action in ('created', 'updated', 'deleted')),
	summary text not null,
	actor_id uuid references profiles (id) on delete set null,
	created_at timestamptz not null default now()
);

create index if not exists activity_log_created_at_idx on activity_log (created_at desc);

alter table activity_log enable row level security;
