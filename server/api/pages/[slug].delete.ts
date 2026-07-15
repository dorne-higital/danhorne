export default defineEventHandler(async (event) => {
	const user = await requireAdminSession(event)

	const rawSlug = getRouterParam(event, 'slug')
	if (!rawSlug) {
		throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
	}
	const slug = decodeURIComponent(rawSlug)

	const supabase = useSupabase()

	// Captured before deleting — nothing to fetch afterwards for the log.
	const { data: current } = await supabase.from('pages').select('id, title, slug').eq('slug', slug).single()

	const { error } = await supabase.from('pages').delete().eq('slug', slug)

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	if (current) {
		await logActivity({
			entityType: 'page',
			entityId: current.id,
			action: 'deleted',
			summary: `Deleted page "${current.title}" (${current.slug})`,
			actorId: user.sub,
		})
	}

	return { ok: true }
})
