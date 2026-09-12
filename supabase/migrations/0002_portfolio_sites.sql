-- ─── Portfolio sites ───────────────────────────────────────────────────────
-- Private "sites I've built" directory (see shared/utils/features.ts's
-- 'portfolio' key + AdminSidebar.vue's role==='admin' gate — invisible to
-- non-admin logins, off by default on every fresh clone of this template).
-- Powers three public content-blocks (PortfolioCarousel/PortfolioGrid/
-- PortfolioStats), all reading through GET /api/portfolio-sites.

create table if not exists portfolio_sites (
	id uuid primary key default gen_random_uuid(),
	name text not null,
	url text not null,
	repo_url text,
	description text,
	-- string[], e.g. ["Nuxt","E-commerce","Branding"] — filter-pill source for
	-- PortfolioGrid, same jsonb-array-of-scalars convention as
	-- site_settings.enabled_features uses for object shape.
	tags jsonb not null default '[]'::jsonb,
	-- Card thumbnail for the carousel/grid — a plain public upload URL, same
	-- as every other `image` field in the content-block schemas.
	cover_image text,
	-- [{url, alt}] — a gallery beyond the single cover image. Not surfaced by
	-- any of the three v1 blocks, but the natural shape for a future
	-- click-through case-study page without a second migration.
	images jsonb not null default '[]'::jsonb,
	client_name text,
	completed_at date,
	is_favourite boolean not null default false,
	is_featured boolean not null default false,
	status text not null default 'published' check (status in ('draft', 'published')),
	-- Manual ordering control in the admin list/grid — lower first, same
	-- ascending convention as everywhere else sort_order-like columns exist.
	sort_order integer not null default 0,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists portfolio_sites_status_idx on portfolio_sites (status);
create index if not exists portfolio_sites_sort_order_idx on portfolio_sites (sort_order);

drop trigger if exists portfolio_sites_set_updated_at on portfolio_sites;
create trigger portfolio_sites_set_updated_at
before update on portfolio_sites
for each row
execute function set_updated_at();

alter table portfolio_sites enable row level security;
