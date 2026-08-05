import type { MenuItem, MenuRecord } from '#shared/types/cms'

export default defineEventHandler(async (event): Promise<MenuRecord> => {
	const user = await requireAdminSession(event)

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

	// Fetched upfront purely for the activity summary — a rename is worth
	// calling out specifically, an items-only edit just says "edited".
	const { data: current } = await supabase.from('menus').select('name').eq('id', id).maybeSingle()

	const { data, error } = await supabase.from('menus').update(update).eq('id', id).select('*').maybeSingle()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: 'Menu not found' })
	}

	await logActivity({
		entityType: 'menu',
		entityId: data.id,
		action: 'updated',
		summary:
			current && current.name !== data.name
				? `Renamed menu "${current.name}" to "${data.name}"`
				: `Updated menu "${data.name}"`,
		actorId: user.sub,
	})

	return data as MenuRecord
})
