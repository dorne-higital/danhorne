-- Optional case-study detail page per portfolio site — stores a full path
-- (e.g. /work/acme or /projects/acme, admin's choice), not just a segment
-- under a fixed prefix. Served by app/pages/[...slug].vue's fallback (tried
-- once the normal pages table has no match for the request path). Nullable,
-- since existing rows (and any site that never gets a write-up) simply have
-- no detail page rather than a broken one. The partial unique index only
-- enforces uniqueness among rows that actually have a slug set.

alter table portfolio_sites add column if not exists slug text;

create unique index if not exists portfolio_sites_slug_idx on portfolio_sites (slug) where slug is not null;
