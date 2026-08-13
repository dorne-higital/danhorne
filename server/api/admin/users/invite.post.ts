export default defineEventHandler(async (event) => {
	const { user: actor } = await requireAdminRole(event)

	const body = await readBody<{ email?: string; first_name?: string; last_name?: string }>(event)
	if (!body?.email) {
		throw createError({ statusCode: 400, statusMessage: 'email is required' })
	}

	const seatLimit = await getSeatLimit()
	if (seatLimit !== null && (await getActiveSeatCount()) >= seatLimit) {
		throw createError({
			statusCode: 400,
			statusMessage: `This site's seat limit (${seatLimit}) is full — remove someone first, or ask about more seats.`,
		})
	}

	// Prefer the fixed public site URL over the inviting request's own origin
	// — otherwise an invite sent while browsing the admin locally generates a
	// localhost link, which is useless to whoever actually receives it. Falls
	// back to the request origin only if NUXT_PUBLIC_SITE_URL isn't set yet
	// (e.g. a freshly cloned project in local dev).
	const siteUrl = useRuntimeConfig().public.siteUrl || getRequestURL(event).origin
	const supabase = useSupabase()
	const { data, error } = await supabase.auth.admin.inviteUserByEmail(body.email, {
		data:
			body.first_name || body.last_name ? { first_name: body.first_name, last_name: body.last_name } : undefined,
		redirectTo: `${siteUrl}/admin/reset-password`,
	})

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	await logActivity({
		entityType: 'user',
		entityId: data.user.id,
		action: 'created',
		summary: `Invited ${data.user.email}`,
		actorId: actor.sub,
	})

	return { id: data.user.id, email: data.user.email }
})
