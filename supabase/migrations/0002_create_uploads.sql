-- Run this against your Supabase (or Neon) Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0002_create_uploads.sql
-- or paste it into the Supabase SQL editor. Neon has no Storage product —
-- the bucket insert below is Supabase-only; swap in your own file storage
-- if you're on Neon.

create extension if not exists pgcrypto;

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
