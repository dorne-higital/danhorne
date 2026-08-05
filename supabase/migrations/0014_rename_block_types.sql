-- Run this against your Supabase (or Neon) Postgres instance, e.g.
--   psql "$DATABASE_URL" -f supabase/migrations/0014_rename_block_types.sql
-- or paste it into the Supabase SQL editor.
--
-- Several content blocks were renamed for clarity (content-blocks/*):
--   GridBlock         -> TiledGrid
--   SectionFlow       -> AlternatingSections
--   Text1Col          -> TextBlock
--   VectorHero        -> DecorativeHero
--   CaseStudyHero     -> DetailPageHero
--   PageHero          -> ImageHero
--   ImageCardCarousel -> CardCarousel
--   FeaturedWork      -> SpotlightGrid
--
-- The "type" field is what's actually stored in every page's blocks jsonb
-- (and in page_revisions' historical snapshots) — without this, any page
-- already using one of these blocks would stop resolving to a component the
-- moment the code deployed, since the old type string no longer matches any
-- registered block. This rewrites every occurrence in place, wherever it
-- appears inside a blocks array, no matter how deep.

create or replace function rename_block_types(input jsonb) returns jsonb as $$
	select case
		when input is null then null
		else coalesce(
			(
				select jsonb_agg(
					jsonb_set(elem, '{type}', to_jsonb(
						case elem ->> 'type'
							when 'GridBlock' then 'TiledGrid'
							when 'SectionFlow' then 'AlternatingSections'
							when 'Text1Col' then 'TextBlock'
							when 'VectorHero' then 'DecorativeHero'
							when 'CaseStudyHero' then 'DetailPageHero'
							when 'PageHero' then 'ImageHero'
							when 'ImageCardCarousel' then 'CardCarousel'
							when 'FeaturedWork' then 'SpotlightGrid'
							else elem ->> 'type'
						end
					))
				)
				from jsonb_array_elements(input) as elem
			),
			'[]'::jsonb
		)
	end
$$ language sql immutable;

update pages set blocks = rename_block_types(blocks) where blocks is not null;
update pages set draft_blocks = rename_block_types(draft_blocks) where draft_blocks is not null;
update page_revisions set blocks = rename_block_types(blocks) where blocks is not null;

drop function rename_block_types(jsonb);
