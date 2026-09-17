import type { FormSummary } from '#shared/types/cms'

export default defineEventHandler(async (event): Promise<FormSummary[]> => {
	await requireAdminSession(event)
	// Also backs the "Contact form" picker on /admin/settings, independent
	// of whether the Forms section itself is enabled — see
	// requireAnyFeatureEnabled.
	await requireAnyFeatureEnabled(event, ['forms', 'settings'], 'Forms')

	const supabase = useSupabase()
	const [{ data, error }, { data: submissionRows }, { data: settings }] = await Promise.all([
		supabase.from('forms').select('id, name, submit_label, success_message, updated_at').order('updated_at', {
			ascending: false,
		}),
		// Just the form_id column, counted in JS below — cheap even at a few
		// thousand rows, and avoids an N+1 query per form for what's only
		// ever shown as a delete-confirm warning (see FormSummary's comment).
		supabase.from('form_submissions').select('form_id'),
		supabase.from('site_settings').select('contact_form_id').eq('id', 'default').maybeSingle(),
	])

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	const counts = new Map<string, number>()
	for (const row of submissionRows ?? []) {
		counts.set(row.form_id, (counts.get(row.form_id) ?? 0) + 1)
	}

	return (data ?? []).map((form) => ({
		...form,
		submission_count: counts.get(form.id) ?? 0,
		is_contact_form: form.id === settings?.contact_form_id,
	})) as FormSummary[]
})
