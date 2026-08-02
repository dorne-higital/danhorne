# TODO

Running list of known gaps/improvements for the CMS. Not urgent unless marked otherwise — pull from here when picking the next thing to work on.

## Consistency nits (worth doing before/while building out the component library)

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

- [x] Native `confirm()` dialogs replaced with the styled `Modal` — new `ConfirmModal.vue` + `useConfirm()` composable (module-scope state, same singleton pattern as `useToast`), mounted once in `admin.vue`. `confirm(message, options)` returns a `Promise<boolean>` so every delete call site just does `if (!(await confirm(...))) return`, same shape as the old `window.confirm()` call. The unsaved-changes route guard (`useUnsavedChanges.ts`) uses it too — Vue Router awaits a Promise returned from `onBeforeRouteLeave`, so that worked out without any special-casing. Added a `.danger` button style (red, for delete/remove confirms) to `_buttons.scss`. The native `beforeunload` prompt in the same file is untouched — browsers force that one, it can never be styled.
- [x] `catch (err: any)` duplication cut — new `shared/utils/getApiErrorMessage.ts` checks both error shapes used across the admin (`err.data.statusMessage` from `$fetch` against our own API, `err.message` from Supabase Auth client calls) and falls back to the caller's message. Replaced at all ~21 call sites; also dropped the now-unnecessary `: any` on each `catch` since the helper takes `unknown`. Left `useUploads.ts`'s two catch blocks alone — those use `describeUploadError()`, a different, upload-specific helper, not this pattern.
- [x] Public endpoints no longer leak raw Postgres error text — new `server/utils/publicError.ts` helper (`publicErrorMessage()`) logs the real error server-side and returns a generic message to the client instead. Applied to every genuinely public route: `settings/index.get`, `forms/[id].get`, `forms/[id]/submit.post`, `menus/[id].get`, `pages/[slug].get`, and `sitemap.xml`. Admin-gated routes were left as-is since only trusted logged-in users see those.
- [x] Form submissions rate-limited — `server/utils/rateLimit.ts` is an in-memory sliding-window throttle (5 submissions per 15 min per IP, across all forms), checked in `server/api/forms/[id]/submit.post.ts` before the DB lookup. It's in-memory rather than DB-backed, so it resets on a cold start and isn't shared across concurrent serverless instances — a determined/distributed spammer can get around it, but it stops the actual threat described (a script hammering the endpoint in a loop) without new infra, which fits a low-traffic personal site.
- [x] Two more dashboard nudges: empty pages (zero content blocks) and broken menu links (pointing at a since-deleted/renamed page slug)
- [x] Dashboard quick actions row — "New page" / "New menu" (pill links that deep-link straight into the existing New modal, already open, via `?new=1`) / "Upload" (lands on the page, file picker can't be auto-triggered without a direct user gesture)
- [x] Users stat card on the dashboard (admin-only, counts active/non-banned users)
- [x] Dashboard "Needs attention" nudges — no homepage (`/`) page, no menu with key `main`, plus a rollup count of pages missing SEO title/description
- [x] Real activity log for pages (create/edit/delete/duplicate) — dashboard's "Recently updated" replaced with "Recent activity", shows what actually happened (`activity_log` table + `server/utils/activityLog.ts`), not just a bare timestamp
- [x] Admin CMS visual overhaul — "Minimal Neutral" theme distinct from the public site (near-white bg, indigo accent, soft shadows, thin 1px borders, plain sans-serif headings). Scoped entirely to `.admin-layout` via CSS custom property overrides in `app/assets/scss/base/_admin-theme.scss` — didn't touch the public site's look at all
- [x] Fixed the editor→pages-list navigation freeze for real — `AdminSidebar.vue` had a blocking `await` and lives in the _layout_ (not a page), so it wasn't covered by Nuxt's page-transition Suspense boundary; made it non-blocking
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
