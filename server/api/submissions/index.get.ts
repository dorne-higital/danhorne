import type { FormSubmission } from '#shared/types/cms'

// Admin only — the global inbox at /admin/submissions, spanning every form.
export default defineEventHandler(async (event): Promise<FormSubmission[]> => {
	await requireAdminSession(event)
	await requireSubmissionsEnabled(event)

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('form_submissions')
		.select(
			'id, form_id, values, email, status, reply_message, replied_at, replied_by, created_at, form:forms(name)',
		)
		.order('created_at', { ascending: false })

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	return (data ?? []) as FormSubmission[]
})
