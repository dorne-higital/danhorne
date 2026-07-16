import type { CompanyInfo, SiteSettings, SocialLinks } from '#shared/types/cms'

const HEX_COLOR = /^#[0-9a-f]{6}$/i

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
}

export default defineEventHandler(async (event): Promise<SiteSettings> => {
	await requireAdminRole(event)

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

	if (Object.keys(update).length === 0) {
		throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })
	}

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('site_settings')
		.update(update)
		.eq('id', 'default')
		.select(
			'id, primary_color, secondary_color, accent_color, background_color, site_name, logo_url, contact_form_id, company, socials',
		)
		.single()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	return data as SiteSettings
})
