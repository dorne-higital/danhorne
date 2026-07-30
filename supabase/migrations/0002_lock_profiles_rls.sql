-- Run this against your Supabase (or Neon) Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0002_lock_profiles_rls.sql
-- or paste it into the Supabase SQL editor.
--
-- Closes a privilege-escalation hole in 0001_init.sql: the "Users can update
-- own profile" policy had no WITH CHECK, so any authenticated user could
-- call the Supabase REST API directly (the anon key + their own JWT are
-- both shipped to the browser) and PATCH their own profiles row to set
-- role: 'admin', bypassing the invite-only admin model entirely.
--
-- The app never actually relies on this policy — every profile write goes
-- through server/api/admin/*.patch.ts using the service-role key, which
-- always bypasses RLS. That already matches 0001_init.sql's own stated
-- architecture ("the app only ever talks to these tables server-side via
-- the service-role key"), so dropping the policy just closes the direct-API
-- hole without touching any application code.

drop policy if exists "Users can update own profile" on profiles;
