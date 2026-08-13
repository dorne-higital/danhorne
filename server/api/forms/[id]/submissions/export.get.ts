import type { FormRecord, FormSubmission } from '#shared/types/cms'

function csvEscape(value: string): string {
	// Wrap in quotes whenever the value could otherwise be misread — a bare
	// comma/quote/newline would corrupt the column structure.
	if (/[",\n]/.test(value)) {
		return `"${value.replace(/"/g, '""')}"`
	}
	return value
}

// Admin only — "Export CSV" on /admin/forms/[id]/submissions.
export default defineEventHandler(async (event) => {
	await requireAdminSession(event)
	await requireSubmissionsEnabled(event)

	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	const supabase = useSupabase()

	const { data: form, error: formError } = await supabase
		.from('forms')
		.select('id, name, fields')
		.eq('id', id)
		.maybeSingle()

	if (formError) {
		throw createError({ statusCode: 500, statusMessage: formError.message })
	}
	if (!form) {
		throw createError({ statusCode: 404, statusMessage: 'Form not found' })
	}

	const { data: submissions, error: submissionsError } = await supabase
		.from('form_submissions')
		.select('id, form_id, values, email, created_at')
		.eq('form_id', id)
		.order('created_at', { ascending: false })

	if (submissionsError) {
		throw createError({ statusCode: 500, statusMessage: submissionsError.message })
	}

	// Columns follow the form's current field order/labels — a submission
	// made before a field was renamed or removed still exports fine (its
	// `values` are keyed by field `name`, which doesn't change on rename),
	// it just won't have data under a field added after it was submitted.
	const fields = (form as FormRecord).fields
	const header = ['Submitted at', ...fields.map((field) => field.label)]

	const lines = [header.map(csvEscape).join(',')]

	for (const submission of (submissions ?? []) as FormSubmission[]) {
		const row = [
			new Date(submission.created_at).toISOString(),
			...fields.map((field) => submission.values[field.name] ?? ''),
		]
		lines.push(row.map(csvEscape).join(','))
	}

	// \r\n per the CSV spec (RFC 4180) — Excel in particular is fussier
	// about bare \n than most spreadsheet apps.
	const csv = lines.join('\r\n')

	const filenameSafe = (form as FormRecord).name.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'form'
	const filename = `${filenameSafe}-submissions-${new Date().toISOString().slice(0, 10)}.csv`

	setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
	setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)

	return csv
})
