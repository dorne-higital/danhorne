-- ─── Blog post bodies become blocks ────────────────────────────────────────
-- Swaps posts.content (a single rich-text HTML blob, no image support) for
-- posts.blocks — the exact same jsonb shape pages.blocks already uses, so a
-- post body is built from the same block canvas/picker/inspector and
-- rendered through the same BlockRenderer.vue as any CMS page. Lets a post
-- mix in Image/Quote/ImageGallery/etc. blocks anywhere in the body instead
-- of being stuck with one rich-text blob and a single fixed cover image.
--
-- No data migration for the old `content` column — only ever held test
-- content on this site, pre-launch, not worth one-off conversion logic for.

alter table posts add column if not exists blocks jsonb not null default '[]'::jsonb;
alter table posts drop column if exists content;
