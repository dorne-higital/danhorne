import type { PageSummary } from '#shared/types/cms'

export default defineEventHandler(async (event): Promise<PageSummary[]> => {
	await requireAdminSession(event)

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('pages')
		.select(
			'id, slug, title, draft_title, seo, parent_id, status, updated_at, updated_by, updater:profiles(nickname), blocks, draft_blocks',
		)
		.order('updated_at', { ascending: false })

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	// Without generated Supabase types, the client can't infer that
	// updated_by -> profiles is a to-one relationship, so it types (and
	// sometimes returns) `updater` as an array — normalize either way.
	// blocks/draft_blocks/draft_title are only fetched to derive
	// blocks_count and has_draft_changes — stripped before returning so
	// this stays a lightweight summary, not the full page.
	const normalized = (data ?? []).map(({ blocks, draft_blocks, draft_title, ...page }) => ({
		...page,
		updater: Array.isArray(page.updater) ? (page.updater[0] ?? null) : page.updater,
		blocks_count: Array.isArray(blocks) ? blocks.length : 0,
		has_draft_changes: page.title !== draft_title || JSON.stringify(blocks) !== JSON.stringify(draft_blocks),
	}))

	return normalized as PageSummary[]
})
