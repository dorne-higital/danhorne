export default defineEventHandler(async (event) => {
	const user = await requireAdminSession(event)

	const supabase = useSupabase()
	const { data: profile, error } = await supabase
		.from('profiles')
		.select('id, name, role')
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
