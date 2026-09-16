export default defineEventHandler(async (event) => {
	const user = await requireAdminSession(event)
	await requireFeatureEnabled(event, 'blog', 'The blog')

	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	const supabase = useSupabase()
	const { data: existing } = await supabase.from('posts').select('title').eq('id', id).maybeSingle()

	const { error } = await supabase.from('posts').delete().eq('id', id)

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	await logActivity({
		entityType: 'post',
		entityId: id,
		action: 'deleted',
		summary: existing ? `Deleted post "${existing.title}"` : 'Deleted post',
		actorId: user.sub,
	})

	return { ok: true }
})
