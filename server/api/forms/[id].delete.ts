export default defineEventHandler(async (event) => {
	const user = await requireAdminSession(event)

	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	const supabase = useSupabase()

	const { data: current } = await supabase.from('forms').select('name').eq('id', id).maybeSingle()

	const { error } = await supabase.from('forms').delete().eq('id', id)

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	await logActivity({
		entityType: 'form',
		entityId: id,
		action: 'deleted',
		summary: `Deleted form "${current?.name ?? id}"`,
		actorId: user.sub,
	})

	return { ok: true }
})
