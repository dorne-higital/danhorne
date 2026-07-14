export default defineEventHandler(async (event) => {
	const user = await requireAdminSession(event)

	const body = await readBody<{ name?: string }>(event)
	if (!body?.name) {
		throw createError({ statusCode: 400, statusMessage: 'name is required' })
	}

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('profiles')
		.update({ name: body.name })
		.eq('id', user.sub)
		.select('id, name, role')
		.single()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	return data
})
