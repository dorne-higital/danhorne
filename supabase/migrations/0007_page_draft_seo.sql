-- SEO used to write straight to the live `seo` column with no draft
-- equivalent, so editing meta title/description on an already-published
-- page changed what's live instantly — unlike every other field in the page
-- editor. draft_seo brings it in line with draft_title/draft_blocks: the
-- editor now writes here, and only Publish copies it onto the live column.
alter table pages add column if not exists draft_seo jsonb;
update pages set draft_seo = seo where draft_seo is null;
