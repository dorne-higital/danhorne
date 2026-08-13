import type { FormSubmission } from '#shared/types/cms'

// Admin only — the submissions list at /admin/forms/[id]/submissions.
export default defineEventHandler(async (event): Promise<FormSubmission[]> => {
	await requireAdminSession(event)
	await requireSubmissionsEnabled(event)

	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('form_submissions')
		.select('id, form_id, values, email, created_at')
		.eq('form_id', id)
		.order('created_at', { ascending: false })

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	return (data ?? []) as FormSubmission[]
})
