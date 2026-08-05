import type { FormFieldDef, FormRecord } from '#shared/types/cms'

interface Body {
	name?: string
	fields?: FormFieldDef[]
	submit_label?: string
	success_message?: string
}

export default defineEventHandler(async (event): Promise<FormRecord> => {
	const user = await requireAdminSession(event)

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

	const { data: current } = await supabase.from('forms').select('name').eq('id', id).maybeSingle()

	const { data, error } = await supabase.from('forms').update(update).eq('id', id).select('*').maybeSingle()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: 'Form not found' })
	}

	await logActivity({
		entityType: 'form',
		entityId: data.id,
		action: 'updated',
		summary:
			current && current.name !== data.name
				? `Renamed form "${current.name}" to "${data.name}"`
				: `Updated form "${data.name}"`,
		actorId: user.sub,
	})

	return data as FormRecord
})
