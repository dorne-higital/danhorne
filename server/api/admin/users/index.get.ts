export default defineEventHandler(async (event) => {
	await requireAdminRole(event)

	const supabase = useSupabase()

	const [{ data: userList, error: userError }, { data: profiles, error: profileError }] = await Promise.all([
		supabase.auth.admin.listUsers(),
		supabase.from('profiles').select('id, first_name, last_name, nickname, role'),
	])

	if (userError) {
		throw createError({ statusCode: 500, statusMessage: userError.message })
	}
	if (profileError) {
		throw createError({ statusCode: 500, statusMessage: profileError.message })
	}

	const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]))

	return userList.users.map((user) => ({
		id: user.id,
		email: user.email ?? '',
		first_name: profileById.get(user.id)?.first_name ?? null,
		last_name: profileById.get(user.id)?.last_name ?? null,
		nickname: profileById.get(user.id)?.nickname ?? null,
		role: profileById.get(user.id)?.role ?? 'user',
		banned: !!user.banned_until && new Date(user.banned_until) > new Date(),
		createdAt: user.created_at,
	}))
})
