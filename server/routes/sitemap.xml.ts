// Dynamic rather than a static file — pages live in Supabase and are added/
// renamed/removed from the admin CMS, so the sitemap has to reflect that
// table directly rather than going stale.
export default defineEventHandler(async (event) => {
	const { siteUrl } = useRuntimeConfig().public

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('pages')
		.select('slug, updated_at')
		.eq('status', 'published')
		.order('slug')

	if (error) {
		throw createError({ statusCode: 500, statusMessage: publicErrorMessage(error) })
	}

	const base = siteUrl.replace(/\/$/, '')
	const urls = (data ?? [])
		.map(
			(page) =>
				`<url><loc>${escapeXml(base + page.slug)}</loc><lastmod>${new Date(page.updated_at).toISOString()}</lastmod></url>`,
		)
		.join('')

	setResponseHeader(event, 'content-type', 'application/xml')
	return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
})

function escapeXml(value: string) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
}
