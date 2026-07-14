-- Run this against your Supabase Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0006_split_profile_name.sql
-- or paste it into the Supabase SQL editor.

alter table profiles add column if not exists first_name text;
alter table profiles add column if not exists last_name text;
alter table profiles add column if not exists nickname text;

-- Best-effort backfill from the old single `name` column for any existing
-- rows — splits on the first space. Fine for a one-time migration; doesn't
-- need to handle every name format perfectly.
update profiles
set
	first_name = split_part(name, ' ', 1),
	last_name = nullif(trim(substring(name from length(split_part(name, ' ', 1)) + 1)), '')
where name is not null;

update profiles
set nickname = nullif(upper(left(coalesce(first_name, ''), 1) || left(coalesce(last_name, ''), 1)), '')
where nickname is null;

alter table profiles drop column if exists name;

-- Trigger now derives first/last name from invite metadata (or leaves them
-- null for the dashboard-created first account) and seeds the nickname from
-- initials — same "first initial + last initial" rule as the backfill above.
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
