# Site Audit — 2026-07-29

A point-in-time review across security, SEO, performance, accessibility, and code quality/devops. Compiled by reading the codebase, DB migrations, and running `yarn audit` — not a runtime penetration test or a Lighthouse run, so treat performance/accessibility numbers as code-level findings, not measured scores.

Two items below (`rate limiting`, `raw error leakage`) were already tracked in [TODO.md](TODO.md) before this audit — kept here too for completeness, not double work.

Severity: 🔴 Critical (live exploit, fix now) · 🟠 High · 🟡 Medium · 🟢 Low/info.

---

## 🟠 High priority

### 2. Stored XSS via unsanitized rich text
`content-blocks/{Accordion,SplitHero,StatHero,SplitContent,Text1Col,CtaBlock,VectorHero,CaseStudyHero,ColumnsText,SectionHeading}/*.vue`

These blocks render Tiptap-authored HTML via `v-html` with no sanitization — no DOMPurify/sanitize-html anywhere in `package.json`. `server/api/pages/[slug].put.ts:661-663` only checks that `blocks` is an array, never sanitizes contents. The #1 escalation path that made this reachable by any user is now closed, but it's still a real risk from any compromised or malicious editor/admin account — injected `<script>`/event-handler HTML in a block gets served to every visitor.

**Fix:** run block HTML through `sanitize-html` (or DOMPurify server-side via `isomorphic-dompurify`) in `server/api/pages/[slug].put.ts` before it's written to the DB — sanitize once at the write boundary rather than on every render.

### 5. Heading hierarchy isn't guaranteed
Only the six hero blocks (`PageHero`, `MinimalHero`, `SplitHero`, `StatHero`, `VectorHero`, `CaseStudyHero`) render an `<h1>`; everything else renders `<h2>`. Block composition is fully admin-driven with no enforcement, so a page built with zero hero blocks has zero `<h1>`s, and one built with two hero blocks has two — both bad for SEO and screen-reader navigation.

**Fix:** either warn in the admin page editor when a page has ≠1 hero block, or make the page-level `<h1>` come from the page title itself (visually hidden if a hero block already shows a heading) so it's never dependent on block choice.

### 6. No redirect mechanism for renamed/moved pages
`app/pages/admin/pages/[slug].vue:67-71` only warns that menu links won't auto-update on rename — there's no redirects table or `routeRules`. Now that [error.vue](app/error.vue) renders a proper 404, a renamed page silently 404s instead of 301-redirecting, losing indexed-URL equity and breaking bookmarks/backlinks.

**Fix:** a small `redirects` table (`old_slug`, `new_slug`) written automatically when a slug changes, checked in `[...slug].vue` before falling through to the 404.

### 7. Zero automated tests
No vitest/jest/playwright/cypress anywhere — confirmed zero `*.test.ts`/`*.spec.ts` files. This is a CMS handling auth, forms, and content mutations with no regression safety net.

**Fix:** start small — vitest coverage on `shared/utils/*` (pure functions like `seoScore.ts`, `formFields.ts`) gives the most value for the least setup, before attempting component/e2e tests.

### 8. No CI
No `.github/workflows/` or any CI config — lint/typecheck/stylelint are 100% manual, nothing blocks a broken PR from merging.

**Fix:** a single GitHub Actions workflow running `yarn lint:css`, `yarn format --check`, and `npx nuxi typecheck` on push would catch most regressions for very little setup.

### 9. Focus ring removed on every form input with no real replacement
`app/components/ui/FormField.vue:257-260`:

```scss
&:focus { border-color: var(--brand-secondary); outline: none; }
```

Strips the native focus ring app-wide on text/email/select/textarea, replacing it with only a border-color shift — a much weaker signal for low-vision/keyboard users, and there's no `:focus-visible` fallback. Compare `app/assets/scss/components/_buttons.scss:38-40`, which does this correctly (`:focus-visible` + visible `outline`).

**Fix:** match the button pattern — keep `outline: none` only inside `&:focus-visible`, paired with an actual `outline: 2px solid var(--brand-secondary); outline-offset: 2px;`.

---

## 🟡 Medium priority

**Security**
- **No HTTP security headers** — no CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, or HSTS configured anywhere (`nuxt.config.ts` `routeRules` could set these).
- **No server-side rate limiting** *(already in TODO.md)* — `server/api/forms/[id]/submit.post.ts` has only a client-side honeypot, trivially bypassed by a script; unlimited requests can burn the Resend send quota.
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
- **Public API errors can leak raw Postgres text** *(already in TODO.md)* — `server/api/pages/[slug].get.ts` and similar return `error.message` straight from Supabase on failure.

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

No `WITH CHECK` clause restricted *which columns* changed. The Supabase anon key + a user's own JWT are both in the browser bundle, so any authenticated non-admin account could call the Supabase REST API directly — bypassing `server/api/admin/users/[id].patch.ts` entirely — and `PATCH` their own `profiles` row to set `role: 'admin'`.

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
