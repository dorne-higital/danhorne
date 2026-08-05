export default defineEventHandler(async (event) => {
	const user = await requireAdminSession(event)

	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	const supabase = useSupabase()

	const { data: current } = await supabase.from('menus').select('name').eq('id', id).maybeSingle()

	const { error } = await supabase.from('menus').delete().eq('id', id)

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	await logActivity({
		entityType: 'menu',
		entityId: id,
		action: 'deleted',
		summary: `Deleted menu "${current?.name ?? id}"`,
		actorId: user.sub,
	})

	return { ok: true }
})
