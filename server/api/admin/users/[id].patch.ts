export default defineEventHandler(async (event) => {
	await requireAdminRole(event)

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

	return data
})
