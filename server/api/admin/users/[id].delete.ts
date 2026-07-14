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
	const { error } = await supabase.auth.admin.updateUserById(id, { ban_duration: '876000h' })

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	return { ok: true }
})
