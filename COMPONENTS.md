# Component library TODO

Suggested content blocks for `content-blocks/`. All named for **what they are**, not where they're used — a block called `ContactDetails` should feel just as at home on a Services page as on a Contact page. Build one at a time with `yarn add-block`, check it off here as it lands.

**Note (2026-08-05):** this list drifted badly out of sync with reality — many blocks below were built without ever being checked off, and some items were duplicated under a different name. Reconciled against the actual `content-blocks/` folder; see each entry for what it actually maps to.

**Note (2026-08-05, later same day):** several blocks were renamed for clarity — dev-shorthand or single-use-case names swapped for names that describe the actual content shape. See `supabase/migrations/0014_rename_block_types.sql` (rewrites the `type` string on any already-saved page/revision so nothing already published breaks).

## Hero

- [ ] **VideoHero** — full-bleed background video with a heading + CTA overlaid on top
- [x] **MinimalHero** — text-only, no image — for simpler inner pages where a big photo would be overkill
- [x] **StatHero** — heading/intro paired with a row of key stats alongside
- [x] Also built, not originally on this list: **DetailPageHero** (was CaseStudyHero), **ImageHero** (was PageHero), **SplitHero**, **DecorativeHero** (was VectorHero)

## Content

- [x] **ColumnsText** — rich text split across 2–3 columns, for denser copy than a single-column text block suits
- [x] **Quote** — a single large pull-quote, standalone (not part of a grid) — distinct from `Testimonials` (below), which is a card with an avatar/glow treatment
- [x] **Accordion** — expandable list of collapsible items — FAQs, process breakdowns, anything Q&A-shaped
- [x] **Tabs** — tabbed panel switcher for grouping related content without a long scroll
- [x] **Timeline** — step-by-step vertical/horizontal list — process, history, "how it works"
- [x] **Divider** — visual spacing/rule between blocks (line/dots/space-only styles, 3 size options)
- [x] **VideoEmbed** — embedded YouTube/Vimeo video with an optional caption
- [x] **OverlapContent** — text + image, styled with an overlapping card and a decorative accent shape behind the image, for a more dynamic look than the plain side-by-side `SplitContent`
- [x] Also built, not originally on this list: **SplitContent**, **AlternatingSections** (was SectionFlow), **SectionHeading** (shared building block reused inside several others, e.g. Accordion/FeatureGrid/TeamGrid), **TechStack**, **TextBlock** (was Text1Col), **FormBlock** (also covers the "ContactForm" idea below), **Testimonial** (single-quote card, see the Quote note above)
- [ ] **GalleryCarousel** — swipeable image carousel — covered by `CardCarousel`, built under that name instead

## Social proof

- [x] **Testimonial** — see Content section above (a single quote card, not a grid — `TestimonialGrid` was never built as a separate multi-item version)
- [x] **LogoStrip** — row of client/partner logos, image uploads with optional links, grayscale-to-color on hover
- [x] **StatsRow** — done, called `FeatureStats`
- [x] **StatCounter** — animated version of the above: numbers count up from 0 when scrolled into view (respects `prefers-reduced-motion`, starts at the real final value so it's correct with no JS)
- [x] **TeamGrid** — team member cards (photo or initials fallback, name, role, short bio)

## Features & sections

- [x] **FeatureGrid** — icon + heading + text, repeated in a grid — benefits, features, "why us" lists
- [x] **PricingTable** — pricing tiers, each with a feature list (nested repeater) and its own CTA (link or contact-form modal), one tier can be highlighted
- [ ] **TeamGrid** — see Social proof above, already built
- [ ] **ChildPagesGrid** — auto-lists and links every child page of the current page (needs the auto-listing work flagged in `TODO.md` — this is the block that work unlocks; until then, Work/Services-style repeaters stay manual)
- [x] Also built, not originally on this list: **SpotlightGrid** (was FeaturedWork), **TiledGrid** (was GridBlock), **CardCarousel** (was ImageCardCarousel)

## Contact

- [x] **ContactForm** — covered by `FormBlock`, embeddable directly in page content
- [x] **ContactDetails** — address/phone/email/hours as a styled info card (phone/email are real `tel:`/`mailto:` links)
- [x] **MapEmbed** — embedded Google Maps iframe, 3 height options
- [x] **SocialLinks** — row of social/contact icon links
- [x] **NewsletterSignup** — email capture block, reuses the existing form system (pick/create a form with just an email field) rather than its own submission logic
