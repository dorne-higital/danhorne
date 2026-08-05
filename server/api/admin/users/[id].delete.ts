// Bans rather than hard-deletes, so pages.updated_by history for this user
// doesn't get orphaned or block deletion.
export default defineEventHandler(async (event) => {
	const { user } = await requireAdminRole(event)

	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}
	if (id === user.sub) {
		throw createError({ statusCode: 400, statusMessage: "You can't remove your own account" })
	}

	const supabase = useSupabase()

	const { data: profile } = await supabase
		.from('profiles')
		.select('first_name, last_name, nickname')
		.eq('id', id)
		.maybeSingle()

	const { error } = await supabase.auth.admin.updateUserById(id, { ban_duration: '876000h' })

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	const name = profile?.nickname || `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || id
	await logActivity({
		entityType: 'user',
		entityId: id,
		action: 'deleted',
		summary: `Removed ${name}`,
		actorId: user.sub,
	})

	return { ok: true }
})
