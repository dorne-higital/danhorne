import type { MenuItem, MenuRecord } from '#shared/types/cms'

export default defineEventHandler(async (event): Promise<MenuRecord> => {
	await requireAdminSession(event)

	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	const body = await readBody<{ name?: string; items?: MenuItem[] }>(event)
	if (!Array.isArray(body?.items)) {
		throw createError({ statusCode: 400, statusMessage: 'items must be an array' })
	}

	const update: Record<string, unknown> = { items: body.items }
	if (body.name) update.name = body.name

	const supabase = useSupabase()
	const { data, error } = await supabase.from('menus').update(update).eq('id', id).select('*').maybeSingle()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: 'Menu not found' })
	}

	return data as MenuRecord
})
