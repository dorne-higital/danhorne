// Public — app/pages/[...slug].vue checks this before falling through to a
// 404, so a visitor hitting an old (renamed-away-from) page slug gets sent
// to wherever that page lives now instead of hitting a dead end.
export default defineEventHandler(async (event): Promise<{ new_slug: string }> => {
	const rawSlug = getRouterParam(event, 'slug')
	if (!rawSlug) {
		throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
	}
	const slug = decodeURIComponent(rawSlug)

	const supabase = useSupabase()
	const { data, error } = await supabase.from('redirects').select('new_slug').eq('old_slug', slug).maybeSingle()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: publicErrorMessage(error) })
	}
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: 'No redirect found' })
	}

	return data
})
