// "Active" means neither banned (server/api/admin/users/[id].delete.ts bans
// rather than hard-deletes) nor an expired temp account (temp.post.ts) —
// same two checks server/api/admin/users/index.get.ts already applies per
// row, just counted instead of listed. Ban status only lives in Auth, not
// on the profiles table, hence the Admin API call rather than a plain
// Postgres count.
export async function getActiveSeatCount(): Promise<number> {
	const supabase = useSupabase()
	const [{ data: userList, error: userError }, { data: profiles, error: profileError }] = await Promise.all([
		supabase.auth.admin.listUsers(),
		supabase.from('profiles').select('id, expires_at'),
	])

	if (userError) {
		throw createError({ statusCode: 500, statusMessage: userError.message })
	}
	if (profileError) {
		throw createError({ statusCode: 500, statusMessage: profileError.message })
	}

	const expiresById = new Map((profiles ?? []).map((profile) => [profile.id, profile.expires_at]))
	const now = Date.now()

	return userList.users.filter((user) => {
		const banned = !!user.banned_until && new Date(user.banned_until) > new Date()
		if (banned) return false
		const expiresAt = expiresById.get(user.id)
		if (expiresAt && new Date(expiresAt).getTime() <= now) return false
		return true
	}).length
}

// null means unlimited (see supabase/migrations/0001_init.sql).
export async function getSeatLimit(): Promise<number | null> {
	const supabase = useSupabase()
	const { data } = await supabase.from('site_settings').select('seat_limit').eq('id', 'default').single()
	return data?.seat_limit ?? null
}
