import type { PortfolioSite } from '#shared/types/cms'

const PATCHABLE_FIELDS = [
	'name',
	'url',
	'repo_url',
	'description',
	'tags',
	'cover_image',
	'images',
	'client_name',
	'completed_at',
	'is_favourite',
	'is_featured',
	'status',
	'sort_order',
	'slug',
] as const satisfies readonly (keyof PortfolioSite)[]

export default defineEventHandler(async (event): Promise<PortfolioSite> => {
	const { user } = await requireAdminRole(event)
	await requireFeatureEnabled(event, 'portfolio', 'The portfolio directory')

	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	const body = await readBody<Partial<PortfolioSite>>(event)
	if (body.name !== undefined && !body.name.trim()) {
		throw createError({ statusCode: 400, statusMessage: 'Name is required' })
	}
	if (body.url !== undefined && !body.url.trim()) {
		throw createError({ statusCode: 400, statusMessage: 'URL is required' })
	}

	const updates: Record<string, unknown> = {}
	for (const field of PATCHABLE_FIELDS) {
		if (body[field] === undefined) continue
		updates[field] = typeof body[field] === 'string' ? (body[field] as string).trim() || null : body[field]
	}
	// A full path, not just a trimmed segment — guarantees a leading slash
	// regardless of whether the admin typed one.
	if (typeof updates.slug === 'string') {
		updates.slug = normalizePath(updates.slug) || null
	}

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('portfolio_sites')
		.update(updates)
		.eq('id', id)
		.select('*')
		.maybeSingle()

	if (error) {
		// 23505 = Postgres unique_violation — the only unique constraint here
		// besides the primary key is portfolio_sites_slug_idx.
		if (error.code === '23505') {
			throw createError({ statusCode: 409, statusMessage: 'That case-study URL is already taken' })
		}
		throw createError({ statusCode: 500, statusMessage: error.message })
	}
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: 'Portfolio site not found' })
	}

	await logActivity({
		entityType: 'portfolio_site',
		entityId: data.id,
		action: 'updated',
		summary: `Updated portfolio site "${data.name}"`,
		actorId: user.sub,
	})

	return data as PortfolioSite
})
