import type { Block, PageSeo } from '#shared/types/cms'

const MAX_REVISIONS_PER_PAGE = 10

// Best-effort, same as logActivity — a revision snapshot failing should
// never break the save it's describing.
export async function recordPageRevision(params: {
	pageId: string
	title: string
	slug: string
	blocks: Block[]
	seo?: PageSeo | null
	actorId?: string | null
}): Promise<void> {
	try {
		const supabase = useSupabase()
		const { error } = await supabase.from('page_revisions').insert({
			page_id: params.pageId,
			title: params.title,
			slug: params.slug,
			blocks: params.blocks,
			seo: params.seo ?? null,
			actor_id: params.actorId ?? null,
		})
		if (error) throw error

		// Trim anything past the last MAX_REVISIONS_PER_PAGE — since this runs
		// after every insert there's normally at most one stale row, but the
		// range is padded well past that in case a page's history was ever
		// seeded some other way.
		const { data: stale } = await supabase
			.from('page_revisions')
			.select('id')
			.eq('page_id', params.pageId)
			.order('created_at', { ascending: false })
			.range(MAX_REVISIONS_PER_PAGE, MAX_REVISIONS_PER_PAGE + 50)

		if (stale && stale.length > 0) {
			await supabase
				.from('page_revisions')
				.delete()
				.in(
					'id',
					stale.map((row) => row.id),
				)
		}
	} catch (err) {
		console.error('Failed to record page revision:', err)
	}
}
