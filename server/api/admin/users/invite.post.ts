export default defineEventHandler(async (event) => {
	await requireAdminRole(event)

	const body = await readBody<{ email?: string; first_name?: string; last_name?: string }>(event)
	if (!body?.email) {
		throw createError({ statusCode: 400, statusMessage: 'email is required' })
	}

	const origin = getRequestURL(event).origin
	const supabase = useSupabase()
	const { data, error } = await supabase.auth.admin.inviteUserByEmail(body.email, {
		data:
			body.first_name || body.last_name ? { first_name: body.first_name, last_name: body.last_name } : undefined,
		redirectTo: `${origin}/admin/reset-password`,
	})

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	return { id: data.user.id, email: data.user.email }
})
