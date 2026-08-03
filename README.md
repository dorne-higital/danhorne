# Nuxt CMS template

A site with a self-hosted, drag-and-drop page-builder CMS built in. Nuxt 4 + Supabase (Postgres, Storage, Auth). No headless CMS SaaS involved — everything runs in this repo and your own Supabase project.

## Stack

- **Nuxt 4** (Vue 3, Nitro server engine)
- **Supabase** — Postgres (content), Storage (uploads), Auth (admin login)
- **SCSS** for styling — no Tailwind
- **yarn** as the package manager (not npm/pnpm)

## Prerequisites

- Node 22 (see `.nvmrc` — run `nvm use` if you use nvm)
- yarn
- A Supabase project ([supabase.com](https://supabase.com), free tier is enough) — Auth, Postgres and Storage are all used
- A [Resend](https://resend.com) account, for the contact form emails

## 1. Install

```bash
yarn install
```

## 2. Environment variables

Copy the example file and fill it in:

```bash
cp .env.example .env
```

| Variable                    | Where to get it                     | Notes                                                                                                                                         |
| --------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `NUXT_RESEND_API_KEY`       | Resend dashboard → API Keys         | Powers the contact form                                                                                                                       |
| `NUXT_CONTACT_EMAIL_TO`     | —                                   | Where contact form submissions land                                                                                                           |
| `NUXT_CONTACT_EMAIL_FROM`   | —                                   | Must be `onboarding@resend.dev` until you verify a sending domain in Resend                                                                   |
| `NUXT_PUBLIC_SITE_URL`      | —                                   | Your real deployed URL, no trailing slash (e.g. `https://danhorne.co.uk`). Public — used to build absolute URLs in `robots.txt`/`sitemap.xml` |
| `NUXT_SUPABASE_URL`         | Supabase dashboard → Settings → API | Your project URL                                                                                                                              |
| `NUXT_SUPABASE_SERVICE_KEY` | Supabase dashboard → Settings → API | **Service role key.** Server-only, never exposed to the browser. Used for all DB/Storage access and admin operations (inviting/banning users) |
| `NUXT_PUBLIC_SUPABASE_URL`  | Same as `NUXT_SUPABASE_URL`         | Public — safe to ship to the browser                                                                                                          |
| `NUXT_PUBLIC_SUPABASE_KEY`  | Supabase dashboard → Settings → API | The **anon/publishable** key (different from the service role key). Public — safe to ship to the browser                                      |

## 3. Set up Supabase

### Database

Run `supabase/migrations/0001_init.sql` against your Supabase project — either paste it into the Supabase dashboard's SQL Editor, or via `psql`:

```bash
psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
```

This creates every table (`pages`, `uploads`, `menus`, `profiles`, `site_settings`, `activity_log`), the `uploads` Storage bucket, and enables RLS across the board.

Then run the later migrations in order (same `psql`/SQL Editor approach) — each is a small, focused change on top of `0001_init.sql`:

- `0002_lock_profiles_rls.sql` — closes a privilege-escalation gap in the default `profiles` RLS policy.
- `0003_redirects.sql` — backs the auto-redirect-on-page-rename feature (`redirects` table).
- `0004_page_views.sql` — backs first-party analytics (`page_views` table, Admin → Analytics).
- `0005_page_view_details.sql` — adds `device_type`/`browser`/`country` columns so Analytics can show those breakdowns too.

### Auth

1. In the Supabase dashboard, go to **Authentication → Providers** and confirm **Email** is enabled.
2. There is no public sign-up page — by design. Create your own first account directly in **Authentication → Users → Add user** (set an email + password). A database trigger automatically makes the very first user an **admin**. Everyone after that defaults to a regular **user** and can only be added via the in-app invite flow (**Users** section in the admin panel, admin-only).
3. Log in at `/admin/login` with the account you just created.
4. Optional but recommended for real use: Supabase's built-in email sending has low rate limits (fine for testing, not for real invites/password resets). Configure custom SMTP under **Authentication → Settings** if you need reliable email delivery — Resend (already used for the contact form) works fine here too.

## 4. Run it

```bash
yarn dev
```

Site: `http://localhost:3000`
Admin panel: `http://localhost:3000/admin/login`

## Other commands

```bash
yarn build      # production build
yarn generate   # static generation
yarn preview    # preview a production build locally
yarn format     # prettier --write .
yarn format:check
yarn lint:css   # stylelint check (app/ and content-blocks/)
yarn lint:css:fix
yarn test       # vitest run — unit tests for shared/app/server utils
yarn test:watch
yarn add-block  # scaffold a new content block — see below
```

CI (`.github/workflows/ci.yml`) runs `format:check`, `lint:css`, `nuxi typecheck`, and `test` on every push to `main` and every PR — no GitHub Secrets required, it doesn't talk to a real Supabase project.

## How the CMS works

- Every page on the site is a **CMS page** — a row in the `pages` table, made of an ordered list of **blocks**. There is no separate "static" homepage; `/` is just a page whose slug is `/`.
- Content is edited at `/admin/pages`: create a page, open it, drag blocks in from the picker, edit their fields, save.
- **Menus** (`/admin/menus`) build the site's nav — multi-menu, up to 3 levels of nesting.
- **Forms** (`/admin/forms`) — build arbitrary forms (field list, labels, types), submitted via Resend. Any form can power the "Say hello" modal (pick one in Settings) or be dropped onto a page via the Form content-block.
- **Uploads** (`/admin/uploads`) is the media library — files go into the Supabase Storage `uploads` bucket.
- **Analytics** (`/admin/analytics`) — first-party pageview tracking, no cookies, no third-party script. Shows totals, a daily trend, top pages/referrers, and device/browser/country breakdowns over a 7/30/90-day window. Country data comes from a geolocation header some hosts inject on incoming requests (Vercel, Netlify, Cloudflare — see `server/utils/geoCountry.ts`); on a plain Node host without one of those, the country breakdown just stays empty rather than guessing.
- **Settings** (`/admin/settings`) — business info/address, logo, which form the contact modal uses, and social links.
- **Users** (`/admin/users`, admin-only) — invite people by email, set their role (`admin`/`user`), or remove them.
- **Profile** (`/admin/profile`) — any logged-in user can update their own name, email, or password.

### Content blocks

Blocks live in `content-blocks/<Name>/`, each with two files:

- `<Name>.schema.ts` — defines the block's fields (what shows up in the admin editor)
- `<Name>.vue` — the component that renders those fields on the actual page

Nothing else needs registering — `content-blocks/registry.ts` auto-discovers every `*.schema.ts` file and the block shows up in the picker automatically.

**To add a new block, run:**

```bash
yarn add-block
```

It's interactive — asks for a name, label, group, and then loops asking for fields (name, label, type, options/defaults as needed). It writes both files in the right shape, formats them, and you're done — just fill in the actual markup/styles in the generated `.vue` file to taste.

Field types available: `text`, `richtext`, `image`, `number`, `select`, `boolean`, `repeater` (a repeatable list of sub-fields, e.g. a list of service cards).

## Project structure

```
app/                  Nuxt app — pages, layouts, components, composables
  pages/admin/        Admin panel (pages/menus/uploads/users/profile editors)
  pages/[...slug].vue Public catch-all — renders any CMS page by slug
  middleware/          admin-auth.global.ts gates everything under /admin
content-blocks/        Every block type (schema + component pairs)
server/api/             Nitro API routes (pages, menus, uploads, admin/users)
server/utils/            Shared server code (Supabase client, admin auth checks)
shared/types/            Types shared between client and server (Nuxt 4 shared/ dir)
shared/utils/            Runtime helpers shared between client and server (auto-imported)
supabase/migrations/     SQL migrations — run these in order against a fresh project
scripts/                add-block.mjs — the block scaffolding CLI
```
