import type { SiteSettings } from '#shared/types/cms'

// Public — no auth. Colors/name/company info aren't sensitive, and the
// public site itself needs this to render (head tags, footer).
export default defineEventHandler(async (): Promise<SiteSettings> => {
	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('site_settings')
		.select(
			'id, primary_color, secondary_color, accent_color, background_color, site_name, logo_url, contact_form_id, company, socials',
		)
		.eq('id', 'default')
		.single()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	return data as SiteSettings
})
