export default defineEventHandler(async (event) => {
	const { user: actor } = await requireAdminRole(event)

	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	const body = await readBody<{ role?: 'admin' | 'user' }>(event)
	if (!body?.role || !['admin', 'user'].includes(body.role)) {
		throw createError({ statusCode: 400, statusMessage: 'role must be "admin" or "user"' })
	}

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('profiles')
		.update({ role: body.role })
		.eq('id', id)
		.select('id, first_name, last_name, nickname, role')
		.single()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	const name = data.nickname || `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim() || id
	await logActivity({
		entityType: 'user',
		entityId: data.id,
		action: 'updated',
		summary: `Changed ${name}'s role to ${data.role}`,
		actorId: actor.sub,
	})

	return data
})
