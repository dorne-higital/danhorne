export type FieldType = 'text' | 'richtext' | 'image' | 'number' | 'select' | 'boolean' | 'repeater' | 'form'

export interface SelectOption {
	label: string
	value: string
}

export interface FieldSchema {
	name: string
	label: string
	type: FieldType
	options?: SelectOption[]
	default?: unknown
	// Only used when type === 'repeater' — describes the shape of each item.
	fields?: FieldSchema[]
}

export interface BlockSchema {
	type: string
	label: string
	// Category shown as a heading in the block picker, e.g. "Hero", "Content".
	// Blocks with no group are bucketed under "Other".
	group?: string
	fields: FieldSchema[]
}

export interface Block {
	id: string
	type: string
	props: Record<string, unknown>
	// Universal per-block setting, not schema-driven — applies data-theme="dark"
	// to the block's root element so it picks up the dark theme CSS vars.
	darkTheme?: boolean
}

export interface PageSeo {
	title?: string
	description?: string
	keywords?: string
	ogImage?: string
}

export type PageStatus = 'draft' | 'published'

export interface PageRecord {
	id: string
	slug: string
	// Live/published content — what an ordinary visitor gets. For a page
	// that's never been published (status === 'draft'), or a request
	// carrying a valid preview token, these are the draft columns below
	// instead — see the content-selection logic in
	// server/api/pages/[slug].get.ts.
	title: string
	blocks: Block[]
	seo?: PageSeo | null
	parent_id?: string | null
	status: PageStatus
	// Bearer secret for /:slug?preview=<token> — lets a draft (or an
	// already-published page's pending changes) be previewed without a CMS
	// login. Stable for the page's lifetime (no regenerate UI yet). Only
	// returned to an authenticated admin session — see [slug].get.ts.
	preview_token?: string
	// The working copy — what Save writes to and the editor edits. Only
	// returned to an authenticated admin session; publishing copies these
	// onto title/blocks above.
	draft_title?: string
	draft_blocks?: Block[]
	// True once draft_title/draft_blocks differ from title/blocks. Only
	// computed for an authenticated admin session.
	has_draft_changes?: boolean
	// Set by the public route when it served draft_title/draft_blocks
	// instead of the published title/blocks (a never-published page, or a
	// request with a matching preview token).
	is_preview?: boolean
	updated_at?: string
	updated_by?: string | null
	// Embedded via the pages.updated_by -> profiles(id) foreign key.
	updater?: { nickname: string | null } | null
}

// blocks_count instead of the full blocks array — keeps the list endpoint's
// payload light (used by the pages list, dashboard, and every page picker)
// while still letting the dashboard flag pages with zero content blocks.
// Drops blocks/draft_blocks (heavy) and preview_token/draft_title (no
// business being in a bulk list) — the editor fetches the full PageRecord
// per-page instead. has_draft_changes is re-declared required since the
// list endpoint always computes it.
export type PageSummary = Omit<PageRecord, 'blocks' | 'preview_token' | 'draft_blocks' | 'draft_title'> & {
	blocks_count: number
	has_draft_changes: boolean
}

export type UserRole = 'admin' | 'user'

export interface UserProfile {
	id: string
	first_name: string | null
	last_name: string | null
	nickname: string | null
	role: UserRole
}

export interface AdminUser {
	id: string
	email: string
	first_name: string | null
	last_name: string | null
	nickname: string | null
	role: UserRole
	banned: boolean
	createdAt: string
	// Set only for temporary accounts (created via the "temp access" flow,
	// not a regular invite) — access is blocked server-side the instant this
	// passes, see requireAdminSession in server/utils/adminAuth.ts.
	expires_at: string | null
}

export interface UploadRecord {
	id: string
	filename: string
	path: string
	url: string
	size: number | null
	mime_type: string | null
	created_at: string
}

export interface MenuItem {
	id: string
	label: string
	href: string
	newTab: boolean
	children: MenuItem[]
}

export interface MenuRecord {
	id: string
	name: string
	items: MenuItem[]
	updated_at?: string
}

export type MenuSummary = Omit<MenuRecord, 'items'>

export interface PageViewRecord {
	path: string
	visitor_hash: string
	created_at: string
	referrer: string | null
	device_type: string | null
	browser: string | null
	country: string | null
}

export interface AnalyticsSummary {
	totalViews: number
	uniqueVisitors: number
	byDay: { date: string; views: number }[]
	topPages: { path: string; views: number }[]
	topReferrers: { referrer: string; views: number }[]
	byDevice: { deviceType: string; views: number }[]
	byBrowser: { browser: string; views: number }[]
	byCountry: { country: string; views: number }[]
}

export interface RedirectRecord {
	old_slug: string
	new_slug: string
	created_at: string
}

// A path that hit a real 404 (checked against redirects first — see
// server/api/track-404.post.ts) — surfaced on /admin/redirects as a
// "someone hit this, want to redirect it?" suggestion.
export interface NotFoundHit {
	id: string
	path: string
	hit_count: number
	first_seen_at: string
	last_seen_at: string
}

// A content snapshot taken on create/save/duplicate/restore. Kept separate
// from ActivityLogEntry, which just records that a change happened — this
// is the actual content you'd restore.
export interface PageRevision {
	id: string
	page_id: string
	title: string
	slug: string
	created_at: string
	// Embedded via the page_revisions.actor_id -> profiles(id) foreign key.
	actor?: { nickname: string | null } | null
}

export type ActivityAction = 'created' | 'updated' | 'deleted'

export interface ActivityLogEntry {
	id: string
	entity_type: string
	entity_id: string
	action: ActivityAction
	summary: string
	actor_id: string | null
	created_at: string
	// Embedded via the activity_log.actor_id -> profiles(id) foreign key.
	actor?: { nickname: string | null } | null
}

export interface ActivityLogPage {
	entries: ActivityLogEntry[]
	total: number
}

export interface CompanyInfo {
	name?: string
	email?: string
	phone?: string
	addressLine1?: string
	addressLine2?: string
	town?: string
	county?: string
	postcode?: string
}

export interface SocialLinks {
	facebook?: string
	instagram?: string
	linkedin?: string
	tiktok?: string
	youtube?: string
	// A phone number, not a URL — unlike the other platforms above, which
	// store the full profile URL directly. Consumers build the wa.me chat
	// link from it (see app/utils/socials.ts), the same way phone/email
	// links get built from a raw value elsewhere in the CMS.
	whatsapp?: string
}

// Layout styles for the site header/footer (/admin/layout) — a fixed set of
// pre-built arrangements, not free-form styling. See AppHeader.vue /
// AppFooter.vue for what each one actually looks like.
export type NavStyle = 'default' | 'centered'
export type FooterStyle = 'default' | 'simple'
// Color theme for the header/footer section itself — 'light'/'dark' apply
// the same --bg-*/--text-* swap as a block's darkTheme flag; 'brand' is a
// solid --brand-primary background with white text, matching the "Brand
// primary" background already offered on hero/CTA blocks. Set independently
// per section — see _themes.scss for the [data-theme='...'] variants.
export type SectionTheme = 'light' | 'dark' | 'brand'
// 'modal' opens the existing contact form modal (useAppModal); 'link' sends
// the visitor to header_cta_url instead — a plain page link, no form.
export type HeaderCtaAction = 'modal' | 'link'

export interface SiteSettings {
	id: string
	primary_color: string
	secondary_color: string
	accent_color: string
	background_color: string
	site_name: string
	logo_url: string | null
	contact_form_id: string | null
	company: CompanyInfo | null
	socials: SocialLinks | null
	nav_style: NavStyle
	footer_style: FooterStyle
	header_theme: SectionTheme
	footer_theme: SectionTheme
	header_cta_enabled: boolean
	header_cta_label: string
	header_cta_action: HeaderCtaAction
	header_cta_url: string | null
	// Google Tag Manager — when both are set, app.vue injects the GTM
	// snippet and the built-in first-party pageview tracker stands down.
	gtm_id: string | null
	gtm_enabled: boolean
	// reCAPTCHA v3 — recaptcha_site_key is public (embedded client-side,
	// same as gtm_id). The secret key is never returned to any client, not
	// even the admin UI — recaptcha_secret_key_set just says whether one's
	// configured, so the admin panel can show "configured" without
	// round-tripping the actual value. See server/api/settings/index.get.ts.
	recaptcha_site_key: string | null
	recaptcha_enabled: boolean
	recaptcha_secret_key_set: boolean
}

export type FormFieldType = 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'checkbox'

export interface FormFieldDef {
	id: string
	name: string
	label: string
	type: FormFieldType
	required: boolean
	width: 'quarter' | 'half' | 'full'
	placeholder?: string
	hint?: string
	// Only used when type === 'select'
	options?: SelectOption[]
	// Which step (1-based) this field appears on. Unset/1 means "the first
	// (and typically only) step" — every existing single-step form keeps
	// working with zero migration since this is purely additive.
	step?: number
	// Only show (and require/validate) this field when another field's
	// value equals a given value — e.g. a "Request CV" checkbox that only
	// appears once an earlier "I am a…" field is set to "Recruiter".
	showIf?: { field: string; equals: string }
}

export interface FormRecord {
	id: string
	name: string
	fields: FormFieldDef[]
	submit_label: string
	success_message: string
	updated_at?: string
}

export type FormSummary = Omit<FormRecord, 'fields'>
