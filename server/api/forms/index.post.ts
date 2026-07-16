import type { FormRecord } from '#shared/types/cms'

export default defineEventHandler(async (event): Promise<FormRecord> => {
	await requireAdminSession(event)

	const body = await readBody<{ name?: string }>(event)
	if (!body?.name) {
		throw createError({ statusCode: 400, statusMessage: 'name is required' })
	}

	const supabase = useSupabase()
	const { data, error } = await supabase.from('forms').insert({ name: body.name, fields: [] }).select('*').single()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	return data as FormRecord
})
