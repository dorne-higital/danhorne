import type { PageRecord } from '#shared/types/cms'

// The only action that changes what a visitor actually sees — copies the
// working draft (draft_title/draft_blocks) onto the live columns and marks
// the page published. Saving (PUT /api/pages/:slug) never does this itself.
export default defineEventHandler(async (event): Promise<PageRecord> => {
	const user = await requireAdminSession(event)

	const rawSlug = getRouterParam(event, 'slug')
	if (!rawSlug) {
		throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
	}
	const slug = decodeURIComponent(rawSlug)

	const supabase = useSupabase()

	const { data: current } = await supabase
		.from('pages')
		.select('id, draft_title, draft_blocks')
		.eq('slug', slug)
		.maybeSingle()
	if (!current) {
		throw createError({ statusCode: 404, statusMessage: 'Page not found' })
	}

	const { data, error } = await supabase
		.from('pages')
		.update({
			title: current.draft_title,
			blocks: current.draft_blocks,
			status: 'published',
			updated_by: user.sub,
		})
		.eq('id', current.id)
		.select('*')
		.single()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	await logActivity({
		entityType: 'page',
		entityId: data.id,
		action: 'updated',
		summary: `Published "${data.title}"`,
		actorId: user.sub,
	})

	await recordPageRevision({
		pageId: data.id,
		title: data.title,
		slug: data.slug,
		blocks: data.blocks,
		seo: data.seo,
		actorId: user.sub,
	})

	return data as PageRecord
})
