import type { PortfolioSite } from '#shared/types/cms'

// Public — no auth, matching server/api/pages/[slug].get.ts's own read for
// the public site. Powers app/pages/[...slug].vue's fallback (tried once the
// pages table has no match for the request path — see that file). Published
// only: a draft site's case-study page 404s for everyone, no preview-token
// machinery like the real Pages editor has — there's no draft/live split to
// preview here.
export default defineEventHandler(async (event): Promise<PortfolioSite> => {
	const slug = getRouterParam(event, 'slug')
	if (!slug) {
		throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
	}

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('portfolio_sites')
		.select('*')
		.eq('slug', decodeURIComponent(slug))
		.eq('status', 'published')
		.maybeSingle()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: publicErrorMessage(error) })
	}
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: 'Not found' })
	}

	return data as PortfolioSite
})
