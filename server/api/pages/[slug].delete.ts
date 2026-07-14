export default defineEventHandler(async (event) => {
	await requireAdminSession(event)

	const rawSlug = getRouterParam(event, 'slug')
	if (!rawSlug) {
		throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
	}
	const slug = decodeURIComponent(rawSlug)

	const supabase = useSupabase()
	const { error } = await supabase.from('pages').delete().eq('slug', slug)

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	return { ok: true }
})
