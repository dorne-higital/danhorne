import type { PortfolioSite } from '#shared/types/cms'

export default defineEventHandler(async (event): Promise<PortfolioSite> => {
	const { user } = await requireAdminRole(event)
	await requireFeatureEnabled(event, 'portfolio', 'The portfolio directory')

	const body = await readBody<Partial<PortfolioSite>>(event)
	const name = body?.name?.trim()
	const url = body?.url?.trim()

	if (!name) {
		throw createError({ statusCode: 400, statusMessage: 'Name is required' })
	}
	if (!url) {
		throw createError({ statusCode: 400, statusMessage: 'URL is required' })
	}

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('portfolio_sites')
		.insert({
			name,
			url,
			repo_url: body.repo_url?.trim() || null,
			description: body.description?.trim() || null,
			tags: Array.isArray(body.tags) ? body.tags : [],
			cover_image: body.cover_image || null,
			images: Array.isArray(body.images) ? body.images : [],
			client_name: body.client_name?.trim() || null,
			completed_at: body.completed_at || null,
			is_favourite: !!body.is_favourite,
			is_featured: !!body.is_featured,
			status: body.status === 'draft' ? 'draft' : 'published',
			sort_order: typeof body.sort_order === 'number' ? body.sort_order : 0,
			slug: body.slug ? normalizePath(body.slug) || null : null,
		})
		.select('*')
		.single()

	if (error) {
		// 23505 = Postgres unique_violation — the only unique constraint here
		// besides the primary key is portfolio_sites_slug_idx.
		if (error.code === '23505') {
			throw createError({ statusCode: 409, statusMessage: 'That case-study URL is already taken' })
		}
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	await logActivity({
		entityType: 'portfolio_site',
		entityId: data.id,
		action: 'created',
		summary: `Added portfolio site "${data.name}"`,
		actorId: user.sub,
	})

	return data as PortfolioSite
})
