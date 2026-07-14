import type { MenuRecord } from '#shared/types/cms'

// Public — the site header/footer fetch menus by id (e.g. "main") to render
// nav, so this can't require an admin session like the other menu routes.
export default defineEventHandler(async (event): Promise<MenuRecord> => {
	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing id' })
	}

	const supabase = useSupabase()
	const { data, error } = await supabase.from('menus').select('*').eq('id', id).maybeSingle()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: 'Menu not found' })
	}

	return data as MenuRecord
})
