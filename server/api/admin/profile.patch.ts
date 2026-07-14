export default defineEventHandler(async (event) => {
	const user = await requireAdminSession(event)

	const body = await readBody<{ first_name?: string; last_name?: string; nickname?: string }>(event)
	if (!body?.first_name && !body?.last_name) {
		throw createError({ statusCode: 400, statusMessage: 'first_name or last_name is required' })
	}

	// Fall back to initials server-side too, so a blank nickname can never
	// slip through even if the client's own auto-fill gets bypassed.
	const nickname =
		body.nickname?.trim() || `${body.first_name?.[0] ?? ''}${body.last_name?.[0] ?? ''}`.toUpperCase() || null

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('profiles')
		.update({ first_name: body.first_name ?? null, last_name: body.last_name ?? null, nickname })
		.eq('id', user.sub)
		.select('id, first_name, last_name, nickname, role')
		.single()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	return data
})
