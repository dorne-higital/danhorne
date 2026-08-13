// Admin only — the unread badge in AdminSidebar's "Submissions" nav item.
export default defineEventHandler(async (event) => {
	await requireAdminSession(event)
	await requireSubmissionsEnabled(event)

	const supabase = useSupabase()
	const { count, error } = await supabase
		.from('form_submissions')
		.select('id', { count: 'exact', head: true })
		.eq('status', 'new')

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	return { count: count ?? 0 }
})
