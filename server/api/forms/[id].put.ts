import type { FormFieldDef, FormRecord } from '#shared/types/cms'

interface Body {
	name?: string
	fields?: FormFieldDef[]
	submit_label?: string
	success_message?: string
}

export default defineEventHandler(async (event): Promise<FormRecord> => {
	await requireAdminSession(event)

	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	const body = await readBody<Body>(event)
	if (!Array.isArray(body?.fields)) {
		throw createError({ statusCode: 400, statusMessage: 'fields must be an array' })
	}

	const update: Record<string, unknown> = { fields: body.fields }
	if (body.name) update.name = body.name
	if (body.submit_label) update.submit_label = body.submit_label
	if (body.success_message) update.success_message = body.success_message

	const supabase = useSupabase()
	const { data, error } = await supabase.from('forms').update(update).eq('id', id).select('*').maybeSingle()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: 'Form not found' })
	}

	return data as FormRecord
})
