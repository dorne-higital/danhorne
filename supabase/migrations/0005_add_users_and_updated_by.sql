-- Run this against your Supabase Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0005_add_users_and_updated_by.sql
-- or paste it into the Supabase SQL editor. Relies on Supabase Auth
-- (auth.users), which exists by default on every Supabase project.

create table if not exists profiles (
	id uuid primary key references auth.users (id) on delete cascade,
	name text,
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

-- Auto-create a profile row for every new auth user (invited or otherwise).
-- The very first user ever created becomes admin automatically; everyone
-- after that defaults to 'user'. This is how the first admin account gets
-- bootstrapped without needing an open public signup page.
create or replace function public.handle_new_user()
returns trigger as $$
declare
	is_first boolean;
begin
	select count(*) = 0 into is_first from public.profiles;
	insert into public.profiles (id, name, role)
	values (
		new.id,
		coalesce(new.raw_user_meta_data ->> 'name', new.email),
		case when is_first then 'admin' else 'user' end
	);
	return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
	after insert on auth.users
	for each row execute function public.handle_new_user();

-- References profiles (not auth.users directly) so PostgREST can embed the
-- updater's name in one query, e.g. .select('*, updater:profiles(name)') —
-- there's no PostgREST-visible FK path from pages straight to auth.users.
alter table pages add column if not exists updated_by uuid references profiles (id) on delete set null;
