export default defineEventHandler(async (event) => {
	await requireAdminRole(event)

	const supabase = useSupabase()

	// Opportunistic cleanup — there's no scheduled job in this app, so
	// expired temp accounts (see temp.post.ts) get hard-deleted here, the
	// next time anyone loads this list, rather than at the exact expiry
	// second. Access itself is already blocked well before this ever runs
	// (requireAdminSession checks expiry on every request), so this is
	// housekeeping, not the security boundary.
	const { data: expired } = await supabase
		.from('profiles')
		.select('id')
		.not('expires_at', 'is', null)
		.lt('expires_at', new Date().toISOString())
	await Promise.all((expired ?? []).map((profile) => supabase.auth.admin.deleteUser(profile.id)))

	const [{ data: userList, error: userError }, { data: profiles, error: profileError }] = await Promise.all([
		supabase.auth.admin.listUsers(),
		supabase.from('profiles').select('id, first_name, last_name, nickname, role, expires_at'),
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
		expires_at: profileById.get(user.id)?.expires_at ?? null,
	}))
})
