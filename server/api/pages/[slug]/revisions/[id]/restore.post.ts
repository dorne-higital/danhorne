import type { PageRecord } from '#shared/types/cms'

// Restores into the working draft (title/blocks -> draft_title/draft_blocks)
// — never straight onto what's live, same reasoning as Save. Publish is
// still required afterward to actually put the restored content back out.
// seo restores immediately (it isn't part of the draft/live split — see
// PageSeoModal.vue). Deliberately leaves slug and parent_id alone, so
// undoing a bad content edit can't also silently move the page's URL or
// re-parent it.
export default defineEventHandler(async (event): Promise<PageRecord> => {
	const user = await requireAdminSession(event)
	await requireFeatureEnabled(event, 'pageHistory', 'Version history')

	const rawSlug = getRouterParam(event, 'slug')
	const revisionId = getRouterParam(event, 'id')
	if (!rawSlug || !revisionId) {
		throw createError({ statusCode: 400, statusMessage: 'Missing slug or revision id' })
	}
	const slug = decodeURIComponent(rawSlug)

	const supabase = useSupabase()

	const { data: page } = await supabase.from('pages').select('id, title').eq('slug', slug).maybeSingle()
	if (!page) {
		throw createError({ statusCode: 404, statusMessage: 'Page not found' })
	}

	const { data: revision } = await supabase
		.from('page_revisions')
		.select('id, page_id, title, blocks, seo')
		.eq('id', revisionId)
		.maybeSingle()
	if (!revision || revision.page_id !== page.id) {
		throw createError({ statusCode: 404, statusMessage: 'Revision not found' })
	}

	const { data, error } = await supabase
		.from('pages')
		.update({
			draft_title: revision.title,
			draft_blocks: revision.blocks,
			seo: revision.seo,
			updated_by: user.sub,
		})
		.eq('id', page.id)
		.select('*')
		.single()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	await logActivity({
		entityType: 'page',
		entityId: page.id,
		action: 'updated',
		summary: `Restored an earlier draft version of "${data.draft_title}"`,
		actorId: user.sub,
	})

	// The restore itself becomes a new revision, so restoring again later
	// (undoing the undo) is still possible.
	await recordPageRevision({
		pageId: data.id,
		title: data.draft_title,
		slug: data.slug,
		blocks: data.draft_blocks,
		seo: data.seo,
		actorId: user.sub,
	})

	return data as PageRecord
})
