import type {
	CompanyInfo,
	FooterStyle,
	HeaderCtaAction,
	NavStyle,
	SectionTheme,
	SiteSettings,
	SocialLinks,
} from '#shared/types/cms'

const HEX_COLOR = /^#[0-9a-f]{6}$/i
const GTM_ID = /^GTM-[A-Z0-9]+$/i
const NAV_STYLES: NavStyle[] = ['default', 'centered']
const FOOTER_STYLES: FooterStyle[] = ['default', 'simple']
const SECTION_THEMES: SectionTheme[] = ['light', 'dark', 'brand']
const HEADER_CTA_ACTIONS: HeaderCtaAction[] = ['modal', 'link']

// Maps an `update` key to a human-readable label for the activity summary —
// several DB columns collapse to one label (the 4 color columns are all
// just "colors" to a reader of the log) rather than listing every column.
const FIELD_LABELS: Record<string, string> = {
	primary_color: 'colors',
	secondary_color: 'colors',
	accent_color: 'colors',
	background_color: 'colors',
	site_name: 'site name',
	logo_url: 'logo',
	contact_form_id: 'contact form',
	company: 'business info',
	socials: 'socials',
	nav_style: 'layout',
	footer_style: 'layout',
	header_theme: 'layout',
	footer_theme: 'layout',
	header_cta_enabled: 'header CTA',
	header_cta_label: 'header CTA',
	header_cta_action: 'header CTA',
	header_cta_url: 'header CTA',
	gtm_id: 'GTM',
	gtm_enabled: 'GTM',
	recaptcha_site_key: 'reCAPTCHA',
	recaptcha_secret_key: 'reCAPTCHA',
	recaptcha_enabled: 'reCAPTCHA',
}

interface Body {
	primary_color?: string
	secondary_color?: string
	accent_color?: string
	background_color?: string
	site_name?: string
	logo_url?: string | null
	contact_form_id?: string | null
	company?: CompanyInfo | null
	socials?: SocialLinks | null
	nav_style?: NavStyle
	footer_style?: FooterStyle
	header_theme?: SectionTheme
	footer_theme?: SectionTheme
	header_cta_enabled?: boolean
	header_cta_label?: string
	header_cta_action?: HeaderCtaAction
	header_cta_url?: string | null
	gtm_id?: string | null
	gtm_enabled?: boolean
	recaptcha_site_key?: string | null
	// Only sent when the admin actually types a new one — the UI never
	// round-trips the existing value, so "not in the body" always means
	// "leave whatever's already saved alone", not "clear it".
	recaptcha_secret_key?: string
	recaptcha_enabled?: boolean
	// submissions_enabled is deliberately not settable here — it's a paid
	// add-on switched on per site directly in the DB, not something a
	// client's own admin login can self-serve. See
	// supabase/migrations/0019_submissions_enabled.sql.
}

export default defineEventHandler(async (event): Promise<SiteSettings> => {
	const { user } = await requireAdminRole(event)

	const body = await readBody<Body>(event)
	const update: Record<string, unknown> = {}

	for (const key of ['primary_color', 'secondary_color', 'accent_color', 'background_color'] as const) {
		const value = body[key]
		if (value === undefined) continue
		if (!HEX_COLOR.test(value)) {
			throw createError({ statusCode: 400, statusMessage: `${key} must be a hex color, e.g. #e63946` })
		}
		update[key] = value
	}

	if (body.site_name !== undefined) {
		if (!body.site_name.trim()) {
			throw createError({ statusCode: 400, statusMessage: 'site_name cannot be empty' })
		}
		update.site_name = body.site_name.trim()
	}

	if (body.logo_url !== undefined) update.logo_url = body.logo_url
	if (body.contact_form_id !== undefined) update.contact_form_id = body.contact_form_id
	if (body.company !== undefined) update.company = body.company
	if (body.socials !== undefined) update.socials = body.socials

	if (body.nav_style !== undefined) {
		if (!NAV_STYLES.includes(body.nav_style)) {
			throw createError({ statusCode: 400, statusMessage: `nav_style must be one of ${NAV_STYLES.join(', ')}` })
		}
		update.nav_style = body.nav_style
	}
	if (body.footer_style !== undefined) {
		if (!FOOTER_STYLES.includes(body.footer_style)) {
			throw createError({
				statusCode: 400,
				statusMessage: `footer_style must be one of ${FOOTER_STYLES.join(', ')}`,
			})
		}
		update.footer_style = body.footer_style
	}

	if (body.header_theme !== undefined) {
		if (!SECTION_THEMES.includes(body.header_theme)) {
			throw createError({
				statusCode: 400,
				statusMessage: `header_theme must be one of ${SECTION_THEMES.join(', ')}`,
			})
		}
		update.header_theme = body.header_theme
	}
	if (body.footer_theme !== undefined) {
		if (!SECTION_THEMES.includes(body.footer_theme)) {
			throw createError({
				statusCode: 400,
				statusMessage: `footer_theme must be one of ${SECTION_THEMES.join(', ')}`,
			})
		}
		update.footer_theme = body.footer_theme
	}

	if (body.header_cta_enabled !== undefined) update.header_cta_enabled = body.header_cta_enabled
	if (body.header_cta_label !== undefined) update.header_cta_label = body.header_cta_label.trim() || 'Say hello'
	if (body.header_cta_action !== undefined) {
		if (!HEADER_CTA_ACTIONS.includes(body.header_cta_action)) {
			throw createError({
				statusCode: 400,
				statusMessage: `header_cta_action must be one of ${HEADER_CTA_ACTIONS.join(', ')}`,
			})
		}
		update.header_cta_action = body.header_cta_action
	}
	if (body.header_cta_url !== undefined) update.header_cta_url = body.header_cta_url?.trim() || null

	const supabase = useSupabase()

	// A "link" CTA with no URL would render a button that does nothing when
	// clicked — check the combined state (this request merged with whatever's
	// already saved), same reasoning as the GTM/reCAPTCHA checks below.
	if (
		update.header_cta_enabled === true ||
		((update.header_cta_action !== undefined || update.header_cta_url !== undefined) &&
			update.header_cta_enabled === undefined)
	) {
		const { data: current } = await supabase
			.from('site_settings')
			.select('header_cta_enabled, header_cta_action, header_cta_url')
			.eq('id', 'default')
			.single()
		const resultingEnabled =
			'header_cta_enabled' in update ? update.header_cta_enabled : current?.header_cta_enabled
		const resultingAction = 'header_cta_action' in update ? update.header_cta_action : current?.header_cta_action
		const resultingUrl = 'header_cta_url' in update ? update.header_cta_url : current?.header_cta_url
		if (resultingEnabled && resultingAction === 'link' && !resultingUrl) {
			throw createError({ statusCode: 400, statusMessage: 'Add a URL before enabling a link-style header CTA' })
		}
	}

	if (body.gtm_id !== undefined) {
		const trimmed = body.gtm_id?.trim() || null
		if (trimmed && !GTM_ID.test(trimmed)) {
			throw createError({ statusCode: 400, statusMessage: 'gtm_id must look like GTM-XXXXXXX' })
		}
		update.gtm_id = trimmed
	}
	if (body.gtm_enabled !== undefined) update.gtm_enabled = body.gtm_enabled

	// Turning GTM on (or leaving it on) with no container ID configured
	// would silently do nothing on the public site — check the combined
	// state, not just this request's body, since gtm_id and gtm_enabled can
	// be saved from two different form submits on /admin/integrations.
	if (update.gtm_enabled === true || (update.gtm_id !== undefined && update.gtm_enabled === undefined)) {
		const { data: current } = await supabase
			.from('site_settings')
			.select('gtm_id, gtm_enabled')
			.eq('id', 'default')
			.single()
		const resultingId = 'gtm_id' in update ? update.gtm_id : current?.gtm_id
		const resultingEnabled = 'gtm_enabled' in update ? update.gtm_enabled : current?.gtm_enabled
		if (resultingEnabled && !resultingId) {
			throw createError({ statusCode: 400, statusMessage: 'Add a container ID before enabling GTM' })
		}
	}

	if (body.recaptcha_site_key !== undefined) update.recaptcha_site_key = body.recaptcha_site_key?.trim() || null
	if (body.recaptcha_secret_key) update.recaptcha_secret_key = body.recaptcha_secret_key.trim()
	if (body.recaptcha_enabled !== undefined) update.recaptcha_enabled = body.recaptcha_enabled

	// Same reasoning as the GTM check above — can't end up "enabled" without
	// both a site key and a secret key actually configured, whichever
	// combination of fields this particular save touched.
	if (
		update.recaptcha_enabled === true ||
		((update.recaptcha_site_key !== undefined || update.recaptcha_secret_key !== undefined) &&
			update.recaptcha_enabled === undefined)
	) {
		const { data: current } = await supabase
			.from('site_settings')
			.select('recaptcha_site_key, recaptcha_secret_key, recaptcha_enabled')
			.eq('id', 'default')
			.single()
		const resultingSiteKey =
			'recaptcha_site_key' in update ? update.recaptcha_site_key : current?.recaptcha_site_key
		const resultingSecretKey =
			'recaptcha_secret_key' in update ? update.recaptcha_secret_key : current?.recaptcha_secret_key
		const resultingEnabled = 'recaptcha_enabled' in update ? update.recaptcha_enabled : current?.recaptcha_enabled
		if (resultingEnabled && (!resultingSiteKey || !resultingSecretKey)) {
			throw createError({ statusCode: 400, statusMessage: 'Add both keys before enabling reCAPTCHA' })
		}
	}

	if (Object.keys(update).length === 0) {
		throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })
	}

	const { data, error } = await supabase
		.from('site_settings')
		.update(update)
		.eq('id', 'default')
		.select(
			'id, primary_color, secondary_color, accent_color, background_color, site_name, logo_url, contact_form_id, company, socials, nav_style, footer_style, header_theme, footer_theme, header_cta_enabled, header_cta_label, header_cta_action, header_cta_url, gtm_id, gtm_enabled, recaptcha_site_key, recaptcha_enabled, recaptcha_secret_key',
		)
		.single()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	const { recaptcha_secret_key, ...settings } = data as SiteSettings & { recaptcha_secret_key: string | null }

	const touched = [...new Set(Object.keys(update).map((key) => FIELD_LABELS[key] ?? key))]
	await logActivity({
		entityType: 'settings',
		entityId: 'default',
		action: 'updated',
		summary: `Updated settings (${touched.join(', ')})`,
		actorId: user.sub,
	})

	return { ...settings, recaptcha_secret_key_set: !!recaptcha_secret_key }
})
