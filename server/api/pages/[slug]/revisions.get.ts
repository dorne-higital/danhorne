import type { PageRevision } from '#shared/types/cms'

// Light payload for the History panel's list — no blocks/seo, same
// PageSummary-style reasoning (fetched full on restore instead).
export default defineEventHandler(async (event): Promise<PageRevision[]> => {
	await requireAdminSession(event)

	const rawSlug = getRouterParam(event, 'slug')
	if (!rawSlug) {
		throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
	}
	const slug = decodeURIComponent(rawSlug)

	const supabase = useSupabase()

	const { data: page } = await supabase.from('pages').select('id').eq('slug', slug).maybeSingle()
	if (!page) {
		throw createError({ statusCode: 404, statusMessage: 'Page not found' })
	}

	const { data, error } = await supabase
		.from('page_revisions')
		.select('id, page_id, title, slug, created_at, actor:profiles(nickname)')
		.eq('page_id', page.id)
		.order('created_at', { ascending: false })

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	// Without generated Supabase types, an embedded to-one relation like
	// actor:profiles(nickname) infers as an array — normalize either way,
	// same as every other embedded-relation read in this project.
	return (data ?? []).map((row) => ({
		...row,
		actor: Array.isArray(row.actor) ? (row.actor[0] ?? null) : row.actor,
	})) as PageRevision[]
})
