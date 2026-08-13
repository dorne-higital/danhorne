-- Run this against your fresh Supabase (or Neon) Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
-- or paste it into the Supabase SQL editor. Neon has no Storage product —
-- the bucket insert below is Supabase-only; swap in your own file storage
-- if you're on Neon.
--
-- Single init migration for a template repo — this is the full schema for a
-- brand new project, not an incremental history (squashed from a longer
-- migration sequence, numbering restarted from here). Every table has RLS
-- enabled with zero policies (bar profiles' own read policy): the app only
-- ever talks to these tables server-side via the service-role key (which
-- always bypasses RLS), so this just closes the direct-API hole that the
-- public anon key (shipped to every browser for Supabase Auth) would
-- otherwise have via Supabase's auto-generated REST API.

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
	-- Temporary/expiring access (/admin/users "Create temp access") — null
	-- means a permanent account. Access is hard-blocked on every
	-- authenticated request the instant this passes (requireAdminSession),
	-- the row itself gets swept on next /admin/users visit.
	expires_at timestamptz,
	created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Read-only — there's deliberately no "update own profile" policy. Every
-- profile write goes through server/api/admin/*.patch.ts using the
-- service-role key (which always bypasses RLS regardless), so a self-update
-- policy would only ever add a privilege-escalation surface (a user PATCHing
-- their own row via the anon key + their own JWT to set role: 'admin')
-- without the app ever actually needing it.
drop policy if exists "Users can read own profile" on profiles;
create policy "Users can read own profile" on profiles
	for select using (auth.uid() = id);

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
-- Live content (title/blocks) is separate from the working draft
-- (draft_title/draft_blocks) that the editor actually edits and the Preview
-- button shows — saving a page never publishes it, only
-- POST /api/pages/:slug/publish copies draft -> live. status gates whether a
-- page exists publicly at all; preview_token is a stable per-page secret
-- that lets a draft be shared via a preview link with no login needed.

create table if not exists pages (
	id text primary key,
	slug text not null unique,
	title text not null,
	blocks jsonb not null default '[]'::jsonb,
	draft_title text not null,
	draft_blocks jsonb not null default '[]'::jsonb,
	status text not null default 'draft' check (status in ('draft', 'published')),
	preview_token uuid not null default gen_random_uuid(),
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
-- AppHeader.vue reads the menu with id 'header-main'; AppFooter.vue reads
-- 'footer-main' (extra link column/inline links) and 'footer-legal' (bottom-
-- bar legal links) — both optional, the footer renders fine with neither.

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
-- Singleton row (id is always 'default') — every admin-editable, per-site
-- knob lives here: brand/business info, the /admin/layout picker, and the
-- optional integrations on /admin/integrations (GTM, reCAPTCHA, and the
-- paid submissions-inbox gate — see form_submissions below).

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
	-- Layout picker (/admin/layout) — header nav arrangement, footer
	-- arrangement, and independent light/dark/brand themes for each.
	nav_style text not null default 'default' check (nav_style in ('default', 'centered')),
	footer_style text not null default 'default' check (footer_style in ('default', 'simple')),
	header_theme text not null default 'light' check (header_theme in ('light', 'dark', 'brand')),
	footer_theme text not null default 'light' check (footer_theme in ('light', 'dark', 'brand')),
	-- Header CTA ("Say hello" button) — on/off, custom label, and either the
	-- contact modal or a plain link.
	header_cta_enabled boolean not null default true,
	header_cta_label text not null default 'Say hello',
	header_cta_action text not null default 'modal' check (header_cta_action in ('modal', 'link')),
	header_cta_url text,
	-- Google Tag Manager (/admin/integrations) — when both are set, app.vue
	-- injects the GTM snippet and the built-in first-party pageview tracker
	-- stands down, so nothing double-counts.
	gtm_id text,
	gtm_enabled boolean not null default false,
	-- reCAPTCHA v3 (/admin/integrations) — recaptcha_site_key is public
	-- (embedded client-side). recaptcha_secret_key is never sent to the
	-- browser, server/api/settings/index.get.ts only ever returns whether
	-- one's set.
	recaptcha_site_key text,
	recaptcha_secret_key text,
	recaptcha_enabled boolean not null default false,
	-- Total Storage budget for this site's uploads bucket, in MB — null means
	-- unlimited. Enforced in server/api/uploads/{sign,confirm}.post.ts against
	-- the actual sum of uploads.size, not a row count (a handful of large
	-- videos costs far more than hundreds of small icons). Not settable via
	-- PATCH /api/settings — raised (or set to null) per site directly in the
	-- DB, same as the paid add-ons below.
	storage_limit_mb integer default 500,
	-- Self-serve checkout (see server/utils/stripe.ts and server/api/billing/*)
	-- — a site can hold a storage subscription and a plan subscription at the
	-- same time, independently, hence two separate subscription-id columns
	-- sharing one customer. Both null until their respective checkout
	-- completes. Server-only: never selected by the public GET /api/settings,
	-- just like recaptcha_secret_key above.
	stripe_customer_id text,
	stripe_subscription_id text,
	stripe_plan_subscription_id text,
	-- Admin seat limit — null means unlimited. Enforced in
	-- server/api/admin/users/{invite,temp}.post.ts against the count of
	-- non-banned, non-expired profiles (see server/utils/seats.ts). Not
	-- settable via PATCH /api/settings, same as everything else here.
	seat_limit integer default 2,
	-- Cosmetic label only — 'starter' | 'growth' | 'pro' | null ("Custom").
	-- Set alongside enabled_features/seat_limit/storage_limit_mb when a site's
	-- moved onto a named bundle (see the plans & pricing doc); nothing in the
	-- app enforces that the flags actually match the label, so /admin/integrations'
	-- plan card always shows what's really enabled underneath it, not just this name.
	plan text,
	-- Per-feature overrides for every item in the admin sidebar (see
	-- shared/utils/features.ts for the full key list and defaults). A key
	-- absent here just falls back to its default there, so this only ever
	-- needs to hold exceptions — in practice the paid add-ons (submissions,
	-- analytics), switched on per site directly in the DB (not via PATCH
	-- /api/settings), so a client can't just enable them themselves for free.
	enabled_features jsonb not null default '{}'::jsonb,
	updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_set_updated_at on site_settings;
create trigger site_settings_set_updated_at
before update on site_settings
for each row
execute function set_updated_at();

-- Single settings row, seeded with the starting palette so the table is
-- never empty and the app never has to handle a "no settings yet" state —
-- change all of this from /admin/settings once the site's live. Every other
-- column above picks up its own default.
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

-- ─── Redirects ─────────────────────────────────────────────────────────────
-- Auto-redirect-on-rename — when a page's slug changes,
-- server/api/pages/[slug].put.ts writes a row here so a visitor hitting the
-- old URL gets a 301 to the new one instead of a 404.

create table if not exists redirects (
	old_slug text primary key,
	new_slug text not null,
	created_at timestamptz not null default now()
);

alter table redirects enable row level security;

-- ─── Page views (first-party analytics) ─────────────────────────────────────
-- No third-party script, no cookies. device_type/browser are derived from
-- the request's user-agent at track time (the raw user-agent string itself
-- is never stored); country comes from a geolocation header some hosts
-- inject (Vercel/Netlify/Cloudflare) and just stays null without one.

create table if not exists page_views (
	id uuid primary key default gen_random_uuid(),
	path text not null,
	referrer text,
	-- sha256(ip + user-agent + date), truncated — approximates a unique
	-- visitor per day without ever storing a raw IP address.
	visitor_hash text not null,
	device_type text,
	browser text,
	country text,
	created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on page_views (created_at desc);
create index if not exists page_views_path_idx on page_views (path);

alter table page_views enable row level security;

-- ─── Page revisions ──────────────────────────────────────────────────────────
-- A snapshot of a page's content is written every time it's created, saved,
-- duplicated, or restored, so an editor can undo a bad save without needing
-- a full site backup. Trimmed to the last 10 per page.

create table if not exists page_revisions (
	id uuid primary key default gen_random_uuid(),
	page_id text not null references pages (id) on delete cascade,
	title text not null,
	slug text not null,
	blocks jsonb not null default '[]'::jsonb,
	seo jsonb,
	actor_id uuid references profiles (id) on delete set null,
	created_at timestamptz not null default now()
);

create index if not exists page_revisions_page_id_idx on page_revisions (page_id, created_at desc);

alter table page_revisions enable row level security;

-- ─── 404 tracking ────────────────────────────────────────────────────────────
-- Logs real 404s (checked against redirects first, so this only fires on
-- genuine dead ends) so /admin/redirects can surface "someone hit /old-page
-- 6 times, want to redirect it?" instead of dead links silently happening.

create table if not exists not_found_hits (
	id uuid primary key default gen_random_uuid(),
	path text not null unique,
	hit_count integer not null default 1,
	first_seen_at timestamptz not null default now(),
	last_seen_at timestamptz not null default now()
);

create index if not exists not_found_hits_hit_count_idx on not_found_hits (hit_count desc);

alter table not_found_hits enable row level security;

-- ─── Form submissions ────────────────────────────────────────────────────────
-- Every form submission (Newsletter Signup, Contact, or any FormBlock)
-- always emails out via Resend AND is always logged here, regardless of
-- whether the submissions inbox (site_settings.enabled_features.submissions)
-- is switched on for this site — nothing is lost if a site upgrades later.

create table if not exists form_submissions (
	id uuid primary key default gen_random_uuid(),
	form_id uuid not null references forms (id) on delete cascade,
	values jsonb not null default '{}'::jsonb,
	-- Convenience column, extracted the same way submit.post.ts already
	-- picks a replyTo — the first field of type 'email' with a value. Lets
	-- the submissions list/export show an email column without needing to
	-- know each form's field names. Null for a form with no email field.
	email text,
	status text not null default 'new' check (status in ('new', 'read', 'replied')),
	-- Set once a reply's been sent from the inbox — only ever holds the most
	-- recent reply, not a full thread.
	reply_message text,
	replied_at timestamptz,
	replied_by uuid references profiles (id) on delete set null,
	created_at timestamptz not null default now()
);

create index if not exists form_submissions_form_id_idx on form_submissions (form_id);
create index if not exists form_submissions_created_at_idx on form_submissions (created_at desc);
create index if not exists form_submissions_status_idx on form_submissions (status);

alter table form_submissions enable row level security;
