# Site Audit — 2026-08-14 follow-up

A second pass, focused on what's changed since 2026-08-02: the new forms/submissions inbox (self-serve feature, feature-gated), four reworked content-blocks (Accordion, ImageGallery, Tabs, TechStack), and a general re-check of security/accessibility/UX. Compiled by reading the codebase directly — same method as the original audit below, not a runtime pen-test or Lighthouse run.

Severity: 🔴 Critical · 🟠 High · 🟡 Medium · 🟢 Low/info.

---

## 🟠 High priority

### Modal has no focus trap and doesn't restore focus on close

`app/components/ui/Modal.vue` — `role="dialog"`/`aria-modal="true"` are set and Escape-to-close works, but focus is never moved into the panel on open (Tab can reach page content hidden behind the overlay) and never returned to the trigger element on close. Same gap, lower severity, in `AppHeader.vue`'s mobile nav drawer (lines 62-66). Also: a modal opened via the `#header` slot instead of the `title` prop gets no accessible name at all (`aria-label` is only set when `title` is used).

**Fix:** add a small focus-trap composable (or the `focus-trap` package) shared between `Modal.vue` and the mobile drawer — focus the panel/first field on open, restore focus to the trigger on close. Set `aria-labelledby` when a slotted header is used instead of `title`.

### Admin form-builder field editor has unlabeled inputs

`app/pages/admin/forms/[id].vue:113,121,132,147,158,165,178,214,235` — every field-editor row (Label, Name, Type, Width, Placeholder, Hint, Step, conditional-logic fields) uses a bare `<label>` with no `for`/`id`, not wrapping its input. A screen reader gets an unlabeled control for every single field in the form builder — the one place where admin-authored forms actually get built. The `Options` row (274-283) has no label at all, just placeholder text.

**Fix:** same `:for`/`:id` pattern already used correctly a few lines up for name/submit-label/success-message (25-45), and in `SchemaField.vue:3-6`.

---

## 🟡 Medium priority

**Security**

- **SVG uploads aren't content-sniffed** — `server/api/uploads/{sign,confirm}.post.ts` only check `mimetype.startsWith('image/')` against the client-reported type; `image/svg+xml` passes. An SVG can carry `<script>`/event-handler payloads — any editor (uploads require `requireAdminSession`, not `requireAdminRole`) can upload one, served back via the Storage public URL. Blast radius is scoped to the Storage subdomain, not the app's own cookies, but it's a real stored-XSS primitive against anyone who opens the file link directly. **Fix:** strip SVG from the accepted type set, or sanitize with an SVG-safe profile before accepting.
- **Rate limiting is still narrow** — refines the 2026-07-29 finding: the public form-submit endpoint now *is* rate-limited (IP-based, 5/15min, plus honeypot + optional reCAPTCHA — good), but the limiter itself is an in-memory `Map` that resets on cold start and isn't shared across concurrent serverless instances (acknowledged in its own code comment). Nothing rate-limits `/admin/login`, `billing/checkout.post.ts`, or admin mutation endpoints generally.
- **CSRF protection is an implicit third-party default, not a deliberate control** — Supabase's session cookie is `SameSite=Lax` (confirmed in `@nuxtjs/supabase`'s own module default, never overridden). That's genuinely enough to mitigate CSRF today, but there's no app-level backstop (custom header check, token) if that default ever changes upstream.

**Accessibility**

- **Brand theme fails contrast for body text** — `app/assets/scss/base/_themes.scss`, `[data-theme='brand']` block: `--text-secondary: rgb(255 255 255 / 75%)` over `--brand-primary` computes to ~3.47:1 — fails AA for normal text (needs 4.5:1). This theme is admin-selectable from `/admin/layout` for header/footer/hero sections, so it's a real risk any time a client picks it. The original audit's "color contrast passes WCAG AA" check didn't cover this admin-configurable theme. **Fix:** darken/desaturate less, or raise the opacity to ~85%+.
- **Block-select in the page editor isn't keyboard-reachable** — `app/components/admin/BlockCanvas.vue:11-14`'s `.block-wrapper` selects a block via `@click` with no `tabindex`/`role`/keyboard handler, unlike every sibling action in the same component (collapse/remove/insert), which are real `<button>`s. A keyboard-only admin can't select a block to edit it.
- **Admin link color is borderline** — `body.is-admin` block, `--link: #307fb0` on `#fafafa` computes to ~4.2:1, just under AA's 4.5:1 for normal text. Small darken (e.g. `#2a6f98`) clears it cleanly.

**UX**

- **Delete/status-change actions have no error handling anywhere in the admin** — `forms/index.vue`, `submissions/index.vue`, `submissions/[id].vue` (delete, toggle-read, send-reply), `pages/index.vue`, `menus/index.vue` all call `$fetch(..., {method:'DELETE'})` with no try/catch and no toast. A failed delete (403, network blip, FK constraint) fails silently — the only exception in the whole app is `users/index.vue`'s `removeUser`, which already does this correctly. **Fix:** wrap the rest in try/catch + `toast.show(msg, 'error')`, matching that one existing correct example. Also convert `submissions/[id].vue`'s inline reply-error paragraph to the shared toast for consistency with `forms/[id].vue`'s save flow, which already uses it.
- **Real responsive bug in the form builder** — `forms/[id].vue` (~line 636), `.field-item-fields .row` forces `grid-template-columns: repeat(2, 1fr)` with no mobile breakpoint — squeezes Label/Name, Type/Width etc. into unreadably narrow columns below ~700px. Its own sibling `.settings-grid` a few lines up in the same file gets this right (`1fr` by default, 2-column only `@media (width >= 640px)`) — this one just missed the guard.

**Observability / quality**

- **`/api/admin/health` is built but surfaced nowhere** — checks DB schema drift + Stripe env vars, gated behind `requireAdminRole`, but nothing in the admin UI ever calls it — no dashboard card, no status page. It's effectively dead code today. **Fix:** a small card on `/admin/index.vue`, or fold it into the existing dashboard nudges pattern.
- **Zero endpoint-level tests** — the 2026-08-02 fix added 73 unit tests for pure functions in `*/utils/*`, which is real coverage, but no test exercises an actual `server/api/**` route handler. Billing (`checkout/portal/status/sync`) and the Stripe webhook — the two places money and cross-tenant isolation logic actually live — have exactly as much test coverage as everything else: none. Worth being the next test investment, not the *-utils files.
- **`TODO.md`'s "footer menu isn't wired up" is stale** — `AppFooter.vue` already fetches and renders real menus (`footer-main`, `footer-legal`) with a working empty-state fallback; the file's own "Done" section already describes this as shipped elsewhere. One-line fix: remove the stale bullet from "Known gaps."
- **Migration squash worth a live-DB sanity check** — `supabase/migrations/` is now a single re-baselined `0001_init.sql` (was several incremental files as of 2026-08-02, including the profiles-RLS-lock and redirects-table migrations). I confirmed the *file* correctly reflects both fixes (no `profiles` self-update policy, `redirects` table present) — but I can't confirm the *live* production database was actually migrated to match this exact file rather than just having the old incremental migrations applied piecemeal. Worth a one-time manual check that the schema matches, since drift here is silently invisible (the health-check endpoint above would catch it, but nothing currently looks at that endpoint).

---

## 🟢 Low priority / nice-to-have

- **`content-blocks/Accordion/Accordion.vue`** trigger button has `aria-expanded` but no `aria-controls`/matching panel `id` — DOM-adjacency covers most screen readers today, but it's not the full APG accordion pattern.
- **`DynamicForm.vue`'s multi-step form** never moves focus or announces the step change (no `aria-live`) when advancing/going back — low impact given it's a short flow, but a screen-reader user gets no signal the form changed under them.
- **Breakpoints aren't centralized** — `$container-md`/`$container-lg` exist in `_layout.scss` but nothing else references them; every block/page hardcodes `768px`/`1024px`/`640px` literals instead (values agree in practice, so this is a maintainability note, not a bug) — plus one one-off `900px` breakpoint in `submissions/[id].vue` that matches neither convention.
- **No HTTP security headers, CORS still fully open** — carried forward from 2026-07-29, still true, not re-investigated further here.
- **No backup/export story for CMS data** — carried forward, still true.
- **Dead env vars** `NUXT_ADMIN_PASSWORD`/`NUXT_ADMIN_SESSION_SECRET` — carried forward, still present in `.env`, still zero code references, still safe to delete.

---

## ✅ Already solid (checked, no action needed)

- New `form_submissions`/`submission_messages`-adjacent tables have RLS enabled with zero policies, matching the established default-deny pattern.
- `formEmail.ts` escapes every interpolated value before building notification/reply HTML — no email-body injection.
- Every new forms/submissions admin route is correctly gated (`requireAdminSession` + `requireSubmissionsEnabled`), including the one place an ID could plausibly cross forms (submission delete is double-scoped by `id` **and** `form_id`).
- Stripe webhook signature verification and the cross-tenant `customerBelongsToThisSite` isolation check are both still intact, not regressed by any of this work.
- The submissions/forms admin UI is genuinely well-built, not the rough edge I expected going in: proper empty states, search/filter, pagination, confirm-before-delete, CSV export at both a per-form and global level, and a considered two-column ticket-style detail layout.
- The four reworked content-blocks (Accordion, ImageGallery, Tabs, TechStack) are complete and consistent with the established block conventions; deleting `OverlapContent`/`StatCounter` left zero dangling references anywhere (registry auto-discovers via glob, so cleanup was automatic).
- `Tabs.vue` is a fully correct ARIA tabs implementation (roles, `aria-selected`, `aria-controls`, roving tabindex, arrow-key nav) — worth using as the reference pattern if `Accordion.vue` gets tightened up.
- `AdminSidebar.vue`'s new Forms/Submissions nav group is correctly wired, feature-gated, and active-state-highlighted; no orphaned admin pages found anywhere in `app/pages/admin/**`.



A point-in-time review across security, SEO, performance, accessibility, and code quality/devops. Compiled by reading the codebase, DB migrations, and running `yarn audit` — not a runtime penetration test or a Lighthouse run, so treat performance/accessibility numbers as code-level findings, not measured scores.

Two items below (`rate limiting`, `raw error leakage`) were already tracked in [TODO.md](TODO.md) before this audit — kept here too for completeness, not double work.

Severity: 🔴 Critical (live exploit, fix now) · 🟠 High · 🟡 Medium · 🟢 Low/info.

---

## 🟠 High priority

### 5. Heading hierarchy isn't guaranteed

Only the six hero blocks (`PageHero`, `MinimalHero`, `SplitHero`, `StatHero`, `VectorHero`, `CaseStudyHero`) render an `<h1>`; everything else renders `<h2>`. Block composition is fully admin-driven with no enforcement, so a page built with zero hero blocks has zero `<h1>`s, and one built with two hero blocks has two — both bad for SEO and screen-reader navigation.

**Fix:** either warn in the admin page editor when a page has ≠1 hero block, or make the page-level `<h1>` come from the page title itself (visually hidden if a hero block already shows a heading) so it's never dependent on block choice.

---

## 🟡 Medium priority

**Security**

- **No HTTP security headers** — no CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, or HSTS configured anywhere (`nuxt.config.ts` `routeRules` could set these).
- **No server-side rate limiting** _(already in TODO.md)_ — `server/api/forms/[id]/submit.post.ts` has only a client-side honeypot, trivially bypassed by a script; unlimited requests can burn the Resend send quota.
- **CORS is fully default/open** — no explicit policy on the public form-submit endpoint, so it can be invoked cross-origin from any site for spam automation.

**SEO**

- **No `<link rel="canonical">`** — `app/pages/[...slug].vue:26-35`'s `useHead()` sets OG tags but never a canonical URL.
- **No Twitter Card meta** — same block, zero `twitter:*` tags; link previews on X/Slack fall back to weaker rendering.
- **No structured data (JSON-LD)** — nothing anywhere. `Person`/`ProfessionalService`, `WebSite`, and `BreadcrumbList` schema would all fit a freelance portfolio site and can earn rich results.
- **Image alt text is fully optional everywhere** — every alt-text schema field defaults to `''` and none are required (`PageHero`, `SplitHero`, `FeaturedWork`, `ImageGallery`, `Timeline`, `SectionFlow`, `VectorHero`, `SplitContent`, `CaseStudyHero`). Only `FeaturedWork` falls back to the item title when blank.
- **Slugs aren't normalized** — `app/pages/admin/pages/index.vue:268-276` only requires a leading `/`; no lowercase/hyphenation enforcement, so `/My Page!` is a valid slug.

**Performance**

- **No caching on public GET routes** — `server/api/settings/index.get.ts`, `server/api/pages/[slug].get.ts`, `server/api/menus/[id].get.ts` set no `Cache-Control`, so every page view refetches from Supabase even though content only changes on admin edits. A `routeRules` entry with `swr` or `s-maxage` would help.
- **Missing intrinsic image dimensions (CLS)** — `NuxtImg` usages across `PageHero`, `SplitHero`, `SplitContent`, `ImageGallery`, `VectorHero`, `CaseStudyHero`, `FeaturedWork`, `Timeline` all correctly use `loading="lazy"` but never set `width`/`height`/`aspect-ratio`, so the browser can't reserve space before Supabase images load.

**Accessibility**

- **No skip-to-content link** — keyboard users tab through the full nav on every page load (`app/app.vue`/`app/layouts/default.vue`).
- **Form errors aren't programmatically linked to their field** — `app/components/ui/FormField.vue:91-97`'s error `<p role="alert">` has no `id`, and the input has no matching `aria-describedby`/`aria-invalid`.

**Code quality / devops**

- **No error monitoring** — server errors are `createError`'d back to the client (correct) but nothing aggregates/alerts on them in production; only visible via host platform logs.
- **No backup/export story** — no documented backup strategy or admin content-export feature for the CMS data.
- **No deployment config in-repo** — no `vercel.json`/`netlify.toml`/`nitro.preset` override, so the deploy target isn't pinned or documented.
- **No pre-commit enforcement** — `format`/`lint:css` scripts exist but nothing (no husky/lint-staged) forces them before a commit, and there's no CI (#8) to catch it after either.

---

## 🟢 Low priority / nice-to-have

- **Dependency vulnerabilities** — `yarn audit --recursive`: 19 advisories (1 critical, 13 high, 4 moderate, 1 low), but every one traces to build/dev tooling (`sharp`'s build chain, `sass`, `stylelint`, `vite`/`nitropack` dev server) — none are in runtime production deps (`@nuxtjs/supabase`, `resend`, `@tiptap/*`, `vue`). Worth a `yarn dedupe` pass, low urgency.
- **Leftover unused env vars** — `.env` defines `NUXT_ADMIN_PASSWORD` and `NUXT_ADMIN_SESSION_SECRET`, referenced nowhere in code — dead vars from before the switch to Supabase Auth. Safe to delete.
- **`<html lang>` not explicitly set** — Nuxt defaults to `en`, but it's implicit rather than configured in `nuxt.config.ts app.head.htmlAttrs`.
- **No `og:url`** — minor omission alongside the missing canonical tag (#Medium).
- **`prefers-reduced-motion` only covers one animation** — the `.float` keyframe respects it (`main.scss:20-24`), but the mobile-nav slide/fade transition and other `--transition-base` hover transitions don't. Low impact given short (200ms) durations.
- **TypeScript is a major version behind** (`^5.6.0` vs `7.x` latest) and Nuxt is a minor behind (`^4.4.8` vs `4.5.1`) — not urgent, TS 7 is a very recent rewrite.
- **Public API errors can leak raw Postgres text** _(already in TODO.md)_ — `server/api/pages/[slug].get.ts` and similar return `error.message` straight from Supabase on failure.

---

## ✅ Already solid (checked, no action needed)

- Every mutating `server/api/**` route correctly gated by `requireAdminSession`/`requireAdminRole`, and RLS is enabled on all tables.
- `supabaseServiceKey` is server-only (`runtimeConfig`, not `public`), never exposed to the client.
- Upload endpoints validate content-type/size and sanitize filenames (`sanitizeFilename`).
- Color contrast passes WCAG AA across all checked token pairs (brand-primary on white, text-secondary in both themes).
- Decorative SVG shapes are correctly `aria-hidden`; images with alt text pass it through properly.
- TypeScript `strict: true` is already on.
- `.env.example` and the README's env-var table are accurate and complete.
- Login already has attempt backoff, an 8-char password minimum, and Supabase's own secure/sameSite/maxAge cookie defaults.
- Single, clean `0001_init.sql` migration — nothing to reorganize.

---

## Fixed since this audit

### 1. ~~Privilege escalation — any logged-in user can make themselves admin~~ — Fixed 2026-07-30

`supabase/migrations/0001_init.sql:47-49` had:

```sql
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
```

No `WITH CHECK` clause restricted _which columns_ changed. The Supabase anon key + a user's own JWT are both in the browser bundle, so any authenticated non-admin account could call the Supabase REST API directly — bypassing `server/api/admin/users/[id].patch.ts` entirely — and `PATCH` their own `profiles` row to set `role: 'admin'`.

Checked what actually depends on this policy: nothing. Every profile write in the app (`server/api/admin/profile.patch.ts`, `server/api/admin/users/[id].patch.ts`) already goes through `useSupabase()`, which uses the **service-role key** and always bypasses RLS — matching `0001_init.sql`'s own header comment that the app only ever talks to these tables server-side. So the policy was pure attack surface with zero legitimate use.

**Fix applied:** `supabase/migrations/0002_lock_profiles_rls.sql` drops the policy outright. No app code changes needed. **This migration hasn't been run against your live database yet** — I don't have DB credentials in this environment (no `DATABASE_URL`, only the REST-API service key, which can't execute DDL). Run it the same way `0001_init.sql` was run:

```
psql "$DATABASE_URL" -f supabase/migrations/0002_lock_profiles_rls.sql
```

or paste its contents into the Supabase SQL editor.

### 3 & 4. ~~No `robots.txt` / No `sitemap.xml`~~ — Fixed 2026-07-30

Both added as dynamic Nitro routes rather than a static `public/robots.txt`, since `robots.txt` needs to point at the sitemap's absolute URL and the sitemap itself has to reflect the live `pages` table (admin-editable, so a static file would go stale):

- [server/routes/robots.txt.ts](server/routes/robots.txt.ts) — disallows `/admin`, adds a `Sitemap:` line when a site URL is configured.
- [server/routes/sitemap.xml.ts](server/routes/sitemap.xml.ts) — queries `pages(slug, updated_at)` directly and renders `<url>` entries for every page, XML-escaped.
- Both need `NUXT_PUBLIC_SITE_URL` set (new env var, documented in `.env.example`/README) to produce absolute URLs — verified locally that with it unset, `sitemap.xml` degrades to relative paths and `robots.txt` just omits the `Sitemap:` line rather than emitting something broken. **Set this in production** or the sitemap won't validate.
- Verified live: `curl localhost:3000/robots.txt` and `/sitemap.xml` both return correctly, homepage still 200.

### 2. ~~Stored XSS via unsanitized rich text~~ — Fixed 2026-07-30

`content-blocks/{Accordion,SplitHero,StatHero,SplitContent,Text1Col,CtaBlock,VectorHero,CaseStudyHero,ColumnsText,SectionHeading}/*.vue` render Tiptap-authored HTML via `v-html` with no sanitization on write.

**Fix applied:** [server/utils/sanitizeBlocks.ts](server/utils/sanitizeBlocks.ts), wired into `server/api/pages/[slug].put.ts` (the sole write path for block content — confirmed `index.post.ts` always inserts `blocks: []` at creation). Two design notes:

- Sanitizes by **content shape, not field name** — walks every string in a block's `props` (recursing into repeaters) and runs it through `sanitize-html` only if it looks like it contains a tag. A hardcoded list of "which fields are richtext" was considered and rejected: the client-side block registry that would've supplied that list uses Vite's `import.meta.glob`, which doesn't work in Nitro's server build (confirmed by an empirical test — it throws `Cannot access '...' before initialization` at runtime), and a manually-maintained field list would silently stop covering new richtext fields added later.
- The tag-sniff pre-check also avoids corrupting plain-text fields: running an untagged string like `"Tom & Jerry"` through `sanitize-html` directly would re-encode it to `"Tom &amp; Jerry"` (verified), which Vue's `{{ }}` would then render as literal text — a regression for any title/subtitle containing `&`, `<`, or `"`. Only strings matching `/<[a-z][\s\S]*>/i` pay the sanitize cost.
- Allowlist (`p, br, strong, b, em, i, s, strike, ul, ol, li, blockquote, code, pre, hr, h1-h6, a[href|target|rel]`, schemes `http/https/mailto/tel`) matches exactly what `RichTextEditor.vue`'s Tiptap config (StarterKit + Link) can produce — verified against `node -e` test cases: `<script>`, `onclick=`, `<img onerror=>`, and `javascript:` hrefs are all stripped; legitimate bold/links/lists pass through unchanged.
- Installed `sanitize-html` + `@types/sanitize-html` (`yarn add`).

### 7. ~~Zero automated tests~~ — Fixed 2026-08-02

No vitest/jest/playwright/cypress anywhere — confirmed zero `*.test.ts`/`*.spec.ts` files. This is a CMS handling auth, forms, and content mutations with no regression safety net.

**Fix applied:** [vitest.config.ts](vitest.config.ts) + 73 tests across 12 files, exactly the "start small" scope this audit originally recommended — pure functions in `shared/utils/*`, `app/utils/*`, and `server/utils/*` (`formFields`, `pageTree`, `seoScore`, `slug`, `getApiErrorMessage`, `formatBytes`, `link`, `socials`, `rateLimit`, `publicError`, `sanitizeBlocks`, `formEmail`). No component/e2e tests yet — that's a bigger lift (needs `@vue/test-utils` + a DOM environment, plus mocking Supabase/h3) and deliberately left for later. `yarn test` / `yarn test:watch` added as scripts.

Also fixed 6 pre-existing `noUncheckedIndexedAccess` type errors in `app/composables/useUploads.ts` that surfaced along the way (unrelated to tests themselves, but were the only thing left failing `npx nuxi typecheck` — needed a clean typecheck for the new CI below to be meaningful).

### 8. ~~No CI~~ — Fixed 2026-08-02

No `.github/workflows/` or any CI config — lint/typecheck/stylelint are 100% manual, nothing blocks a broken PR from merging.

**Fix applied:** [.github/workflows/ci.yml](.github/workflows/ci.yml) — runs on every push to `main` and every PR: `yarn format:check` (new script — the existing `yarn format` writes in place, not CI-safe), `yarn lint:css`, `npx nuxi typecheck`, `yarn test`. Uses placeholder env values (not secrets) purely so `nuxt prepare` sees every `runtimeConfig` key populated — nothing in this workflow talks to real Supabase/Resend, so no GitHub Secrets are required to get it running.

### 9. ~~Focus ring removed on every form input with no real replacement~~ — Fixed 2026-08-02

`app/components/ui/FormField.vue:257-260` stripped the native focus ring app-wide on text/email/select/textarea via `&:focus { outline: none; }`, replacing it with only a border-color shift — a much weaker signal for low-vision/keyboard users, with no `:focus-visible` fallback. `app/assets/scss/components/_buttons.scss` already did this correctly (`:focus-visible` + visible `outline`), so this was pure inconsistency, not a design decision.

**Fix applied:** matched the button pattern everywhere it was missing — `:focus` keeps just the border-color shift, `:focus-visible` gets an explicit `outline: 2px solid var(--brand-secondary); outline-offset: 2px;`. Turned out `FormField.vue` wasn't the only offender — grepped for `outline: none` and found the same anti-pattern in three more places, fixed identically: `SchemaField.vue` (admin block-prop inputs), `RichTextEditor.vue` (the Tiptap content area), and `pages/[slug].vue` (the page editor's title/slug/parent inputs).

### 6. ~~No redirect mechanism for renamed/moved pages~~ — Fixed 2026-08-02

`app/pages/admin/pages/[slug].vue:67-71` only warns that menu links won't auto-update on rename — there was no redirects table or `routeRules`. Now that [error.vue](app/error.vue) renders a proper 404, a renamed page silently 404'd instead of 301-redirecting, losing indexed-URL equity and breaking bookmarks/backlinks.

**Fix applied:**

- [supabase/migrations/0003_redirects.sql](supabase/migrations/0003_redirects.sql) — new `redirects (old_slug primary key, new_slug, created_at)` table, RLS enabled with no policies (service-role only, same as every other table). **Not yet applied to the live DB** — run it the same way as `0002_lock_profiles_rls.sql`.
- [server/utils/redirects.ts](server/utils/redirects.ts)'s `recordRedirect()`, called from `server/api/pages/[slug].put.ts` whenever a page's slug actually changes. Best-effort (same pattern as `activityLog.ts`) — a bookkeeping failure here never blocks the actual page save. Also collapses chains (a redirect that used to point at the slug now being renamed away from gets repointed at the final destination) and clears any stale redirect that shares a slug with the _new_ URL (covers renaming a page back to something it used to be called).
- [server/api/redirects/[slug].get.ts](server/api/redirects/[slug].get.ts) — public lookup, checked from `app/pages/[...slug].vue` before it falls through to a 404; issues a real `navigateTo(..., { redirectCode: 301 })`.
- Admin-gated `server/api/redirects/index.{get,post}.ts` and `server/api/redirects/[slug].delete.ts`, plus a new **Redirects** page in the admin sidebar (`app/pages/admin/redirects/index.vue`) — lists every redirect (auto and manual), and lets you add one by hand (e.g. an old marketing URL that was never actually a page slug) or delete one you don't want anymore. Manual creation rejects a URL that's currently a live page's slug, since that redirect could never fire.
- Verified live: with the migration _not yet applied_, the public lookup endpoint 500s through `publicErrorMessage()` (generic message, not raw Postgres text) rather than crashing, and a genuinely nonexistent page still cleanly 404s — confirmed the feature degrades safely until the migration is run.
