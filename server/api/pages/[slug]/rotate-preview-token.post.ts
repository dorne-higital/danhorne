import type { PageRecord } from '#shared/types/cms'

// The preview_token is otherwise a stable per-page secret set once at
// creation and never rotated — if a draft preview link leaks, this is the
// only way to kill it without a direct database edit.
export default defineEventHandler(async (event): Promise<Pick<PageRecord, 'preview_token'>> => {
	const user = await requireAdminSession(event)
	await requireFeatureEnabled(event, 'pages', 'Pages')

	const rawSlug = getRouterParam(event, 'slug')
	if (!rawSlug) {
		throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
	}
	const slug = decodeURIComponent(rawSlug)

	const supabase = useSupabase()

	const { data, error } = await supabase
		.from('pages')
		.update({ preview_token: crypto.randomUUID() })
		.eq('slug', slug)
		.select('id, preview_token')
		.single()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: 'Page not found' })
	}

	await logActivity({
		entityType: 'page',
		entityId: data.id,
		action: 'updated',
		summary: `Rotated preview link for "${slug}"`,
		actorId: user.sub,
	})

	return data as Pick<PageRecord, 'preview_token'>
})
