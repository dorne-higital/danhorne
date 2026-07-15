export type FieldType = 'text' | 'richtext' | 'image' | 'number' | 'select' | 'boolean' | 'repeater'

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

export interface PageRecord {
	id: string
	slug: string
	title: string
	blocks: Block[]
	seo?: PageSeo | null
	parent_id?: string | null
	updated_at?: string
	updated_by?: string | null
	// Embedded via the pages.updated_by -> profiles(id) foreign key.
	updater?: { nickname: string | null } | null
}

// blocks_count instead of the full blocks array — keeps the list endpoint's
// payload light (used by the pages list, dashboard, and every page picker)
// while still letting the dashboard flag pages with zero content blocks.
export type PageSummary = Omit<PageRecord, 'blocks'> & { blocks_count: number }

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

export interface SiteSettings {
	id: string
	primary_color: string
	secondary_color: string
	accent_color: string
	background_color: string
	site_name: string
	company: CompanyInfo | null
}
