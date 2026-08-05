import type { MenuRecord } from '#shared/types/cms'

export default defineEventHandler(async (event): Promise<MenuRecord> => {
	const user = await requireAdminSession(event)

	const body = await readBody<{ id?: string; name?: string }>(event)
	if (!body?.id || !body?.name) {
		throw createError({ statusCode: 400, statusMessage: 'id and name are required' })
	}

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('menus')
		.insert({ id: body.id, name: body.name, items: [] })
		.select('*')
		.single()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	await logActivity({
		entityType: 'menu',
		entityId: data.id,
		action: 'created',
		summary: `Created menu "${data.name}"`,
		actorId: user.sub,
	})

	return data as MenuRecord
})
