export default defineEventHandler(async (event) => {
	await requireAdminSession(event)

	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	const supabase = useSupabase()
	const { error } = await supabase.from('menus').delete().eq('id', id)

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	return { ok: true }
})
