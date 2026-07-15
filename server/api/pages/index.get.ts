import type { PageSummary } from '#shared/types/cms'

export default defineEventHandler(async (event): Promise<PageSummary[]> => {
	await requireAdminSession(event)

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('pages')
		.select('id, slug, title, seo, parent_id, updated_at, updated_by, updater:profiles(nickname), blocks')
		.order('updated_at', { ascending: false })

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	// Without generated Supabase types, the client can't infer that
	// updated_by -> profiles is a to-one relationship, so it types (and
	// sometimes returns) `updater` as an array — normalize either way.
	// blocks is only fetched to derive blocks_count — stripped before
	// returning so this stays a lightweight summary, not the full page.
	const normalized = (data ?? []).map(({ blocks, ...page }) => ({
		...page,
		updater: Array.isArray(page.updater) ? (page.updater[0] ?? null) : page.updater,
		blocks_count: Array.isArray(blocks) ? blocks.length : 0,
	}))

	return normalized as PageSummary[]
})
