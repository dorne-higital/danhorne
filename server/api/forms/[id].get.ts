import type { FormRecord } from '#shared/types/cms'

// Public — the contact modal and any FormBlock on the public site fetch a
// form's field definitions by id to render it, so this can't require an
// admin session like the other form routes.
export default defineEventHandler(async (event): Promise<FormRecord> => {
	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	const supabase = useSupabase()
	const { data, error } = await supabase.from('forms').select('*').eq('id', id).maybeSingle()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: 'Form not found' })
	}

	return data as FormRecord
})
