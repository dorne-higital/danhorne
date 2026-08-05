// Dismisses a suggestion without creating a redirect for it — e.g. it's
// just a bot scanning garbage URLs, not worth fixing. If the same path
// 404s again later it'll simply reappear as a fresh suggestion.
export default defineEventHandler(async (event) => {
	await requireAdminSession(event)

	const rawPath = getRouterParam(event, 'path')
	if (!rawPath) {
		throw createError({ statusCode: 400, statusMessage: 'Missing path' })
	}
	const path = decodeURIComponent(rawPath)

	const supabase = useSupabase()
	const { error } = await supabase.from('not_found_hits').delete().eq('path', path)

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	return { ok: true }
})
