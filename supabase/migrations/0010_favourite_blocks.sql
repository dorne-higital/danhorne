-- Lets an admin mark content-block types as favourites from either the
-- internal /admin/components style guide or the real page-builder pickers
-- (BlockPicker.vue, InsertBlockMenu.vue) — site-wide, not per-user, since
-- this is currently always a single-admin site. Same jsonb-array-of-scalars
-- convention as enabled_features / portfolio_sites.tags.
alter table site_settings add column if not exists favourite_blocks jsonb not null default '[]'::jsonb;
