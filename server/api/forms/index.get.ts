import type { FormSummary } from '#shared/types/cms'

export default defineEventHandler(async (event): Promise<FormSummary[]> => {
	await requireAdminSession(event)

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('forms')
		.select('id, name, submit_label, success_message, updated_at')
		.order('updated_at', { ascending: false })

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	return (data ?? []) as FormSummary[]
})
