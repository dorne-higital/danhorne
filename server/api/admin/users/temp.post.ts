// Creates a time-boxed account with an admin-set password — unlike
// invite.post.ts, there's no email step (email_confirm: true) since the
// point is handing someone (e.g. a QA contractor) working access right now.
// Access is enforced server-side in requireAdminSession the instant
// expires_at passes; the row itself gets swept on the next /admin/users load
// (see index.get.ts) rather than at the exact expiry second — no scheduled
// job running in this app to do it any sooner.
export default defineEventHandler(async (event) => {
	const { user: actor } = await requireAdminRole(event)

	const body = await readBody<{
		email?: string
		password?: string
		first_name?: string
		last_name?: string
		expiresAt?: string
	}>(event)

	if (!body?.email) {
		throw createError({ statusCode: 400, statusMessage: 'email is required' })
	}
	if (!body?.password || body.password.length < 8) {
		throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
	}
	if (!body?.expiresAt) {
		throw createError({ statusCode: 400, statusMessage: 'expiresAt is required' })
	}
	const expiresAt = new Date(body.expiresAt)
	if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
		throw createError({ statusCode: 400, statusMessage: 'expiresAt must be a valid time in the future' })
	}

	// Occupies a seat for as long as it's valid, same as a real invite.
	const seatLimit = await getSeatLimit()
	if (seatLimit !== null && (await getActiveSeatCount()) >= seatLimit) {
		throw createError({
			statusCode: 400,
			statusMessage: `This site's seat limit (${seatLimit}) is full — remove someone first, or ask about more seats.`,
		})
	}

	const supabase = useSupabase()
	const { data, error } = await supabase.auth.admin.createUser({
		email: body.email,
		password: body.password,
		email_confirm: true,
		user_metadata:
			body.first_name || body.last_name ? { first_name: body.first_name, last_name: body.last_name } : undefined,
	})

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	// handle_new_user() already created the profile row (and would make it
	// 'admin' if this were somehow the very first user ever) — force it to a
	// plain, time-boxed 'user' account regardless of that trigger's default.
	const { error: profileError } = await supabase
		.from('profiles')
		.update({ role: 'user', expires_at: expiresAt.toISOString() })
		.eq('id', data.user.id)

	if (profileError) {
		throw createError({ statusCode: 500, statusMessage: profileError.message })
	}

	await logActivity({
		entityType: 'user',
		entityId: data.user.id,
		action: 'created',
		summary: `Created temporary access for ${data.user.email} (expires ${expiresAt.toLocaleString('en-GB')})`,
		actorId: actor.sub,
	})

	return { id: data.user.id, email: data.user.email, expires_at: expiresAt.toISOString() }
})
