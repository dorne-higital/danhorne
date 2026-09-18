import type { Block } from '#shared/types/cms'

// Backs the /admin/components style guide's usage-count badges — how many
// times each block TYPE currently appears across the site's published
// pages. Reads `blocks` (live), not `draft_blocks` — a page's `blocks`
// column only ever reflects its last-published content, so filtering to
// status='published' and tallying that column is exactly "what's actually
// live", same reasoning as server/api/pages/index.get.ts's blocks_count.
// Unbounded scan, no pagination — same as pages/index.get.ts, this table is
// expected to stay small (a single site's page tree).
export default defineEventHandler(async (event): Promise<Record<string, number>> => {
	await requireAdminSession(event)
	await requireFeatureEnabled(event, 'componentLibrary', 'The component library')

	const supabase = useSupabase()
	const { data, error } = await supabase.from('pages').select('status, blocks').eq('status', 'published')

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	const counts: Record<string, number> = {}
	for (const page of data ?? []) {
		const blocks = (page.blocks ?? []) as Block[]
		for (const block of blocks) {
			counts[block.type] = (counts[block.type] ?? 0) + 1
		}
	}

	return counts
})
