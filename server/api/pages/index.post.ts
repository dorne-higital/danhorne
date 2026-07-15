import type { PageRecord } from '#shared/types/cms'

export default defineEventHandler(async (event): Promise<PageRecord> => {
	const user = await requireAdminSession(event)

	const body = await readBody<{ id?: string; slug?: string; title?: string; parent_id?: string | null }>(event)
	if (!body?.id || !body?.slug || !body?.title) {
		throw createError({ statusCode: 400, statusMessage: 'id, slug and title are required' })
	}

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('pages')
		.insert({ id: body.id, slug: body.slug, title: body.title, blocks: [], parent_id: body.parent_id ?? null })
		.select('id, slug, title, blocks, parent_id, updated_at')
		.single()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	await logActivity({
		entityType: 'page',
		entityId: data.id,
		action: 'created',
		summary: `Created page "${data.title}"`,
		actorId: user.sub,
	})

	return data as PageRecord
})
