import type { NotFoundHit } from '#shared/types/cms'

export default defineEventHandler(async (event): Promise<NotFoundHit[]> => {
	await requireAdminSession(event)

	const supabase = useSupabase()

	const [hitsResult, pagesResult, redirectsResult] = await Promise.all([
		supabase.from('not_found_hits').select('*').order('hit_count', { ascending: false }),
		supabase.from('pages').select('slug'),
		supabase.from('redirects').select('old_slug'),
	])

	if (hitsResult.error) {
		throw createError({ statusCode: 500, statusMessage: hitsResult.error.message })
	}

	// A hit whose path is now a live page slug, or already has a redirect,
	// is already resolved — filtered out here rather than needing every
	// place that could resolve one (page create/rename, manual redirect) to
	// separately remember to delete the hit row too.
	const resolvedPaths = new Set([
		...(pagesResult.data ?? []).map((page) => page.slug),
		...(redirectsResult.data ?? []).map((redirect) => redirect.old_slug),
	])

	return (hitsResult.data ?? []).filter((hit) => !resolvedPaths.has(hit.path)) as NotFoundHit[]
})
