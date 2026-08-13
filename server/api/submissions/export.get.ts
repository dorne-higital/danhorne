function csvEscape(value: string): string {
	if (/[",\n]/.test(value)) {
		return `"${value.replace(/"/g, '""')}"`
	}
	return value
}

// Admin only — "Export CSV" on /admin/submissions. Spans every form at
// once, so (unlike the old per-form export this replaced) columns can't
// follow one form's field labels — each row's answers are flattened into a
// single JSON column instead.
export default defineEventHandler(async (event) => {
	await requireAdminSession(event)
	await requireSubmissionsEnabled(event)

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('form_submissions')
		.select('email, status, values, created_at, form:forms(name)')
		.order('created_at', { ascending: false })

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	const header = ['Submitted at', 'Form', 'Email', 'Status', 'Values']
	const lines = [header.map(csvEscape).join(',')]

	for (const submission of data ?? []) {
		const formName = (submission.form as unknown as { name: string } | null)?.name ?? ''
		const row = [
			new Date(submission.created_at).toISOString(),
			formName,
			submission.email ?? '',
			submission.status,
			JSON.stringify(submission.values ?? {}),
		]
		lines.push(row.map((value) => csvEscape(String(value))).join(','))
	}

	const csv = lines.join('\r\n')
	const filename = `submissions-${new Date().toISOString().slice(0, 10)}.csv`

	setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
	setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)

	return csv
})
