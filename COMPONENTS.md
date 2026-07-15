# Component library TODO

Suggested content blocks for `content-blocks/`, on top of the 7 already built. All named for **what they are**, not where they're used — a block called `ContactDetails` should feel just as at home on a Services page as on a Contact page. Build one at a time with `yarn add-block`, check it off here as it lands.

## Already built

- [x] **Hero** — centered hero with background image, heading, subheading, CTA button
- [x] **SplitHero** — heading/text on one side, image on the other
- [x] **TextBlock** — single-column rich text
- [x] **ImageGallery** — fixed image grid
- [x] **Services** — repeater grid of service cards
- [x] **Work** — repeater grid of project/client cards
- [x] **Cta** — full-width call-to-action banner

## Hero

- [ ] **VideoHero** — full-bleed background video with a heading + CTA overlaid on top
- [ ] **MinimalHero** — text-only, no image — for simpler inner pages where a big photo would be overkill
- [ ] **StatHero** — heading/intro paired with a row of key stats alongside (e.g. "10 years", "120 projects shipped")

## Content

- [ ] **ColumnsText** — rich text split across 2–3 columns, for denser copy than `TextBlock` suits
- [ ] **Quote** — a single large pull-quote, standalone (not part of a grid)
- [ ] **Accordion** — expandable list of collapsible items — FAQs, process breakdowns, anything Q&A-shaped
- [ ] **Tabs** — tabbed panel switcher for grouping related content without a long scroll
- [ ] **Timeline** — step-by-step vertical/horizontal list — process, history, "how it works"
- [ ] **Divider** — visual spacing/rule between blocks, adjustable size and style
- [ ] **VideoEmbed** — embedded YouTube/Vimeo video with an optional caption
- [ ] **GalleryCarousel** — swipeable image carousel, the sliding alternative to `ImageGallery`'s static grid

## Social proof

- [ ] **TestimonialGrid** — grid/list of client testimonials (quote, name, company, optional photo)
- [ ] **LogoStrip** — row of client/partner/tech logos
- [ ] **StatsRow** — big standalone number callouts, not tied to a hero (e.g. a mid-page "by the numbers" strip)

## Features & sections

- [ ] **FeatureGrid** — icon + heading + text, repeated in a grid — benefits, features, "why us" lists
- [ ] **PricingTable** — pricing tiers, each with a feature list and its own CTA
- [ ] **TeamGrid** — team member cards (photo, name, role, short bio)
- [ ] **ChildPagesGrid** — auto-lists and links every child page of the current page (needs the auto-listing work flagged in `TODO.md` — this is the block that work unlocks; until then, Work/Services-style repeaters stay manual)

## Contact

- [ ] **ContactForm** — the existing contact form, embeddable directly in page content instead of only reachable via the header/footer modal
- [ ] **ContactDetails** — address/phone/email/hours as a styled info card
- [ ] **MapEmbed** — embedded location map
- [ ] **SocialLinks** — row of social/contact icon links
- [ ] **NewsletterSignup** — email capture form, standalone block
