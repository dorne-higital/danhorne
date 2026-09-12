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

	// Portfolio case-study pages — a separate table from pages above, so a
	// separate query; `.not('slug', 'is', null)` since a portfolio site's
	// slug (a full path, e.g. /work/acme — not just a segment) is optional
	// (see supabase/migrations/0003_portfolio_sites_slug.sql).
	const { data: portfolioSites, error: portfolioError } = await supabase
		.from('portfolio_sites')
		.select('slug, updated_at')
		.eq('status', 'published')
		.not('slug', 'is', null)
		.order('slug')

	if (portfolioError) {
		throw createError({ statusCode: 500, statusMessage: publicErrorMessage(portfolioError) })
	}

	const base = siteUrl.replace(/\/$/, '')
	const urls = (data ?? [])
		.map(
			(page) =>
				`<url><loc>${escapeXml(base + page.slug)}</loc><lastmod>${new Date(page.updated_at).toISOString()}</lastmod></url>`,
		)
		.concat(
			(portfolioSites ?? []).map(
				(site) =>
					`<url><loc>${escapeXml(base + site.slug)}</loc><lastmod>${new Date(site.updated_at).toISOString()}</lastmod></url>`,
			),
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
