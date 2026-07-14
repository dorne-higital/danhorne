# danhorne

Freelance portfolio site with a self-hosted, drag-and-drop page-builder CMS built in. Nuxt 4 + Supabase (Postgres, Storage, Auth). No headless CMS SaaS involved — everything runs in this repo and your own Supabase project.

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
| `NUXT_SUPABASE_URL`         | Supabase dashboard → Settings → API | Your project URL                                                                                                                              |
| `NUXT_SUPABASE_SERVICE_KEY` | Supabase dashboard → Settings → API | **Service role key.** Server-only, never exposed to the browser. Used for all DB/Storage access and admin operations (inviting/banning users) |
| `NUXT_PUBLIC_SUPABASE_URL`  | Same as `NUXT_SUPABASE_URL`         | Public — safe to ship to the browser                                                                                                          |
| `NUXT_PUBLIC_SUPABASE_KEY`  | Supabase dashboard → Settings → API | The **anon/publishable** key (different from the service role key). Public — safe to ship to the browser                                      |

## 3. Set up Supabase

### Database

Run every file in `supabase/migrations/` **in order** against your Supabase project — either paste each one into the Supabase dashboard's SQL Editor, or via `psql`:

```bash
psql "$DATABASE_URL" -f supabase/migrations/0001_create_pages.sql
psql "$DATABASE_URL" -f supabase/migrations/0002_create_uploads.sql
psql "$DATABASE_URL" -f supabase/migrations/0003_create_menus.sql
psql "$DATABASE_URL" -f supabase/migrations/0004_add_page_seo.sql
psql "$DATABASE_URL" -f supabase/migrations/0005_add_users_and_updated_by.sql
```

This creates the `pages`, `uploads`, `menus`, and `profiles` tables, plus the `uploads` Storage bucket (migration `0002`).

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
yarn lint:css   # stylelint check (app/ and content-blocks/)
yarn lint:css:fix
yarn add-block  # scaffold a new content block — see below
```

## How the CMS works

- Every page on the site is a **CMS page** — a row in the `pages` table, made of an ordered list of **blocks**. There is no separate "static" homepage; `/` is just a page whose slug is `/`.
- Content is edited at `/admin/pages`: create a page, open it, drag blocks in from the picker, edit their fields, save.
- **Menus** (`/admin/menus`) build the site's nav — multi-menu, up to 3 levels of nesting.
- **Uploads** (`/admin/uploads`) is the media library — files go into the Supabase Storage `uploads` bucket.
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
