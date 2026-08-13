import type { FormRecord, FormSubmission } from '#shared/types/cms'

// Admin only — detail view at /admin/submissions/[id]. Embeds the form's
// name and field definitions so the page can render each answer under its
// proper label instead of the raw field name.
export default defineEventHandler(async (event) => {
	await requireAdminSession(event)
	await requireSubmissionsEnabled(event)

	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('form_submissions')
		.select(
			'id, form_id, values, email, status, reply_message, replied_at, replied_by, created_at, form:forms(name, fields)',
		)
		.eq('id', id)
		.maybeSingle()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: 'Submission not found' })
	}

	return data as unknown as FormSubmission & { form: { name: string; fields: FormRecord['fields'] } | null }
})
