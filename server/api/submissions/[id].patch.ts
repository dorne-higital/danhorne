import type { FormSubmission, SubmissionStatus } from '#shared/types/cms'

const STATUSES: SubmissionStatus[] = ['new', 'read', 'replied']

// Admin only — "Mark as read/unread/replied" on /admin/submissions and
// /admin/submissions/[id]. The reply endpoint sets status to 'replied'
// itself; this is for the manual toggles (mark read on open, mark unread,
// etc).
export default defineEventHandler(async (event) => {
	await requireAdminSession(event)
	await requireSubmissionsEnabled(event)

	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	const body = await readBody<{ status?: SubmissionStatus }>(event)
	if (!body.status || !STATUSES.includes(body.status)) {
		throw createError({ statusCode: 400, statusMessage: `status must be one of ${STATUSES.join(', ')}` })
	}

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('form_submissions')
		.update({ status: body.status })
		.eq('id', id)
		.select('id, form_id, values, email, status, reply_message, replied_at, replied_by, created_at')
		.maybeSingle()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: 'Submission not found' })
	}

	return data as FormSubmission
})
