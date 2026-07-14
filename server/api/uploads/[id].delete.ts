export default defineEventHandler(async (event) => {
	await requireAdminSession(event)

	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	const supabase = useSupabase()

	const { data: existing, error: fetchError } = await supabase
		.from('uploads')
		.select('path')
		.eq('id', id)
		.maybeSingle()

	if (fetchError) {
		throw createError({ statusCode: 500, statusMessage: fetchError.message })
	}
	if (!existing) {
		throw createError({ statusCode: 404, statusMessage: 'Upload not found' })
	}

	const { error: storageError } = await supabase.storage.from('uploads').remove([existing.path])
	if (storageError) {
		throw createError({ statusCode: 500, statusMessage: storageError.message })
	}

	const { error: deleteError } = await supabase.from('uploads').delete().eq('id', id)
	if (deleteError) {
		throw createError({ statusCode: 500, statusMessage: deleteError.message })
	}

	return { ok: true }
})
