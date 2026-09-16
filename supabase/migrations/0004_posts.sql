-- ─── Blog posts ────────────────────────────────────────────────────────────
-- Real content type for the blog (see shared/utils/features.ts's 'blog' key —
-- on by default, living in AdminSidebar.vue's normal "Content" group, not the
-- role-gated Admin group). Single-version like portfolio_sites (no draft/live
-- split the way `pages` has) since a post is one linear piece of writing, not
-- a page assembled from independently-draftable blocks.
-- Powers the public /blog and /blog/[slug] routes plus the BlogGrid
-- content-block, all reading through GET /api/posts.

create table if not exists posts (
	id uuid primary key default gen_random_uuid(),
	-- Single path segment (via slugify(), not normalizePath()) — posts always
	-- live under the fixed /blog/ prefix, unlike portfolio_sites.slug which is
	-- a whole custom path.
	slug text not null unique,
	title text not null,
	excerpt text,
	-- Rich HTML body from RichTextEditor.vue, same convention as any
	-- content-block `richtext` field.
	content text,
	cover_image text,
	category text,
	-- string[], same jsonb-array-of-scalars convention as
	-- portfolio_sites.tags.
	tags jsonb not null default '[]'::jsonb,
	author_name text,
	author_photo text,
	-- Freeform display string (e.g. "5 min read") rather than a computed
	-- number, so an editor can override it same as any other authored field.
	read_time text,
	status text not null default 'draft' check (status in ('draft', 'published')),
	published_at timestamptz,
	-- Mirrors pages.seo's shape exactly (PageSeo: title/description/keywords/
	-- ogImage) so the same admin SEO panel and scoreSeo() rubric apply.
	seo jsonb,
	-- Manual ordering control for BlogGrid, same ascending convention as
	-- portfolio_sites.sort_order.
	sort_order integer not null default 0,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists posts_status_idx on posts (status);
create index if not exists posts_sort_order_idx on posts (sort_order);
create index if not exists posts_published_at_idx on posts (published_at);

drop trigger if exists posts_set_updated_at on posts;
create trigger posts_set_updated_at
before update on posts
for each row
execute function set_updated_at();

alter table posts enable row level security;
