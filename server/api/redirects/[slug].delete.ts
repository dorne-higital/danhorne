export default defineEventHandler(async (event) => {
	const user = await requireAdminSession(event)

	const rawSlug = getRouterParam(event, 'slug')
	if (!rawSlug) {
		throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
	}
	const slug = decodeURIComponent(rawSlug)

	const supabase = useSupabase()

	const { data: current } = await supabase.from('redirects').select('new_slug').eq('old_slug', slug).maybeSingle()

	const { error } = await supabase.from('redirects').delete().eq('old_slug', slug)

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	await logActivity({
		entityType: 'redirect',
		entityId: slug,
		action: 'deleted',
		summary: current ? `Deleted redirect "${slug}" → "${current.new_slug}"` : `Deleted redirect "${slug}"`,
		actorId: user.sub,
	})

	return { ok: true }
})
