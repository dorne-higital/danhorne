import type { PortfolioSite } from '#shared/types/cms'

// Admin-only — the site editor's dedicated single-row fetch. Deliberately
// separate from GET /api/portfolio-sites (the public/admin list both the
// carousel/grid/stats blocks and /admin/portfolio's list page read from):
// sharing that endpoint's cache key here meant the editor could show a stale
// list right after creating a new site (the list fetch made moments earlier,
// before the new row existed, got reused instead of a fresh request) — this
// route's own key sidesteps that entirely, and is a cheaper fetch besides.
export default defineEventHandler(async (event): Promise<PortfolioSite> => {
	await requireAdminRole(event)
	await requireFeatureEnabled(event, 'portfolio', 'The portfolio directory')

	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	const supabase = useSupabase()
	const { data, error } = await supabase.from('portfolio_sites').select('*').eq('id', id).maybeSingle()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: 'Portfolio site not found' })
	}

	return data as PortfolioSite
})
