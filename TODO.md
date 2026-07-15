# TODO

Running list of known gaps/improvements for the CMS. Not urgent unless marked otherwise — pull from here when picking the next thing to work on.

## Should do soon-ish

- [ ] **Contact form has no rate limiting.** Honeypot spam protection exists (`server/api/contact.post.ts`), but nothing stops someone hammering the endpoint and burning through the Resend send quota. Needs a lightweight IP-based throttle.
- [ ] **Public endpoints can leak raw Postgres error text.** `server/api/pages/[slug].get.ts` (and possibly others) returns `error.message` straight from Supabase to the client on failure. Fine for admin-only endpoints, not fine for public ones — genericize the message on anything unauthenticated.

## Consistency nits (worth doing before/while building out the component library)

- [ ] **Native `confirm()` dialogs instead of the styled `Modal`.** Used for all deletes and the unsaved-changes guard — the one place the admin UI looks like the browser instead of the app. A `ConfirmModal` wrapper would fix all call sites at once.
- [ ] **`catch (err: any)` duplicated ~17 times** across admin pages, all doing the same `err?.data?.statusMessage ?? fallback` dance. A shared `getApiErrorMessage(err, fallback)` helper in `shared/utils/` would cut the repetition.
- [ ] **Drag-and-drop has no keyboard alternative.** Block canvas, block picker, menu tree, repeater items — all `vuedraggable`, all mouse-only. Real accessibility gap if that matters here.

## Known gaps, not urgent

- [ ] Footer menu isn't wired up — `AppFooter.vue` has no menu rendering, only the hardcoded Connect/LinkedIn links.
- [ ] Renaming a page's slug doesn't cascade to its children's slugs (parent/child pages) — they stay pointing at the old parent path.
- [ ] Menu links don't auto-update when the page they point to gets its slug renamed.

## Maybe later

- [ ] Auto-listing "Child Pages" content block — drag onto a parent page (e.g. Work), automatically lists/links every child page instead of maintaining links by hand.
- [ ] Extend the activity log to menus/users/uploads/settings — same mechanism as pages (`server/utils/activityLog.ts`), just needs a `logActivity()` call added to each of their ~9 remaining mutating endpoints.

---

## Done

- [x] Two more dashboard nudges: empty pages (zero content blocks) and broken menu links (pointing at a since-deleted/renamed page slug)
- [x] Dashboard quick actions row — "New page" / "New menu" (pill links that deep-link straight into the existing New modal, already open, via `?new=1`) / "Upload" (lands on the page, file picker can't be auto-triggered without a direct user gesture)
- [x] Users stat card on the dashboard (admin-only, counts active/non-banned users)
- [x] Dashboard "Needs attention" nudges — no homepage (`/`) page, no menu with key `main`, plus a rollup count of pages missing SEO title/description
- [x] Real activity log for pages (create/edit/delete/duplicate) — dashboard's "Recently updated" replaced with "Recent activity", shows what actually happened (`activity_log` table + `server/utils/activityLog.ts`), not just a bare timestamp
- [x] Admin CMS visual overhaul — "Minimal Neutral" theme distinct from the public site (near-white bg, indigo accent, soft shadows, thin 1px borders, plain sans-serif headings). Scoped entirely to `.admin-layout` via CSS custom property overrides in `app/assets/scss/base/_admin-theme.scss` — didn't touch the public site's look at all
- [x] Fixed the editor→pages-list navigation freeze for real — `AdminSidebar.vue` had a blocking `await` and lives in the *layout* (not a page), so it wasn't covered by Nuxt's page-transition Suspense boundary; made it non-blocking
- [x] `<NuxtLoadingIndicator>` added — visual feedback on every admin navigation, since some of it involves real blocking work (auth check + data fetch)
- [x] Fixed the admin sidebar actually overlapping content — `.admin-sidebar` is `position: fixed` (deliberate), which needs a matching `margin-left` on `.admin-main` that wasn't there
- [x] `useFetch` key collisions fixed on `/api/admin/me`, `/api/uploads`, and `/api/settings` — turned out `/api/admin/me` was the actual cause of a recurring "pages editor → back to pages list stays frozen until refresh" bug (the admin sidebar mounts for the first time on that exact transition, which is what triggered it)
- [x] RLS enabled on `pages`/`uploads`/`menus`/`site_settings` (`supabase/migrations/0010_enable_rls.sql`)
- [x] Removed old static `/work` pages + data, migrating that content into the CMS instead
- [x] Mobile hamburger nav (`MobileNavItem.vue` + drawer in `AppHeader.vue`)
- [x] Raw `<img>` → `NuxtImg` across the whole app
- [x] Deleted orphaned pre-CMS components (`HeroSection`, `CtaSection`, `ServicesSection`, `WorkSection`)
- [x] Stylelint fully clean (`FormField.vue`, `_reset.scss`)
- [x] Parent/child pages (nested URLs, tree view in `/admin/pages`, re-parenting)
- [x] Theme + site settings panel (`/admin/settings` — brand colors, site name, business/contact info)
- [x] Block scaffolding CLI (`yarn add-block`)
- [x] Real auth via Supabase (roles, invites, profile, "updated by")
- [x] Full CMS build-out — pages, menus, uploads, content blocks, SEO fields, image alt text
