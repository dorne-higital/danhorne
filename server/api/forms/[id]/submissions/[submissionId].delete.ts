// Admin only — deletes a single submission from the list at
// /admin/forms/[id]/submissions.
export default defineEventHandler(async (event) => {
	await requireAdminSession(event)
	await requireSubmissionsEnabled(event)

	const id = getRouterParam(event, 'id')
	const submissionId = getRouterParam(event, 'submissionId')
	if (!id || !submissionId) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	const supabase = useSupabase()
	// Scoped to form_id too, not just the submission's own id — otherwise
	// someone with a submission id from one form could delete via a
	// different form's URL.
	const { error } = await supabase.from('form_submissions').delete().eq('id', submissionId).eq('form_id', id)

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	return { ok: true }
})
