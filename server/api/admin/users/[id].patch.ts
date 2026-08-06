export default defineEventHandler(async (event) => {
	const { user: actor } = await requireAdminRole(event)

	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	// expires_at only ever accepted as `null` here — this endpoint can clear
	// a temp account's expiry (make it permanent), not reschedule it to a
	// new time. Rescheduling isn't something the UI offers; if that changes,
	// this needs proper validation like temp.post.ts's expiresAt check.
	const body = await readBody<{ role?: 'admin' | 'user'; expires_at?: null }>(event)

	const update: Record<string, unknown> = {}
	if (body?.role !== undefined) {
		if (!['admin', 'user'].includes(body.role)) {
			throw createError({ statusCode: 400, statusMessage: 'role must be "admin" or "user"' })
		}
		update.role = body.role
	}
	if (body?.expires_at === null) {
		update.expires_at = null
	}
	if (Object.keys(update).length === 0) {
		throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })
	}

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('profiles')
		.update(update)
		.eq('id', id)
		.select('id, first_name, last_name, nickname, role, expires_at')
		.single()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	const name = data.nickname || `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim() || id
	const summary =
		'role' in update && 'expires_at' in update
			? `Changed ${name}'s role to ${data.role} and made their access permanent`
			: 'role' in update
				? `Changed ${name}'s role to ${data.role}`
				: `Made ${name}'s temporary access permanent`
	await logActivity({
		entityType: 'user',
		entityId: data.id,
		action: 'updated',
		summary,
		actorId: actor.sub,
	})

	return data
})
