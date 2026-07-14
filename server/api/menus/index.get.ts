import type { MenuSummary } from '#shared/types/cms'

export default defineEventHandler(async (event): Promise<MenuSummary[]> => {
	await requireAdminSession(event)

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('menus')
		.select('id, name, updated_at')
		.order('updated_at', { ascending: false })

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	return (data ?? []) as MenuSummary[]
})
