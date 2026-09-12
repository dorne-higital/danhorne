export default defineEventHandler(async (event) => {
	const { user } = await requireAdminRole(event)
	await requireFeatureEnabled(event, 'portfolio', 'The portfolio directory')

	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	const supabase = useSupabase()
	const { data: existing } = await supabase.from('portfolio_sites').select('name').eq('id', id).maybeSingle()

	const { error } = await supabase.from('portfolio_sites').delete().eq('id', id)

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	await logActivity({
		entityType: 'portfolio_site',
		entityId: id,
		action: 'deleted',
		summary: existing ? `Deleted portfolio site "${existing.name}"` : 'Deleted portfolio site',
		actorId: user.sub,
	})

	return { ok: true }
})
