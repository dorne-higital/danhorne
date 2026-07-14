export default defineEventHandler(async (event) => {
	const user = await requireAdminSession(event)

	const supabase = useSupabase()
	const { data: profile, error } = await supabase
		.from('profiles')
		.select('id, first_name, last_name, nickname, role')
		.eq('id', user.sub)
		.single()

	if (error || !profile) {
		throw createError({ statusCode: 500, statusMessage: 'Could not load profile' })
	}

	return {
		user: { id: user.sub, email: user.email ?? '' },
		profile,
	}
})
