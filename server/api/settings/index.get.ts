import type { SiteSettings } from '#shared/types/cms'

// Public — no auth. Colors/name/company info aren't sensitive, and the
// public site itself needs this to render (head tags, footer).
export default defineEventHandler(async (): Promise<SiteSettings> => {
	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('site_settings')
		.select(
			'id, primary_color, secondary_color, accent_color, background_color, site_name, logo_url, contact_form_id, company, socials, nav_style, footer_style, header_theme, footer_theme, header_cta_enabled, header_cta_label, header_cta_action, header_cta_url, gtm_id, gtm_enabled, recaptcha_site_key, recaptcha_enabled, recaptcha_secret_key, enabled_features',
		)
		.eq('id', 'default')
		.single()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: publicErrorMessage(error) })
	}

	// recaptcha_secret_key must never leave the server — swap it for a
	// boolean before this goes out.
	const { recaptcha_secret_key, ...settings } = data as SiteSettings & { recaptcha_secret_key: string | null }

	return { ...settings, recaptcha_secret_key_set: !!recaptcha_secret_key }
})
