import type { PageRecord } from '#shared/types/cms'

// :slug is the URL-encoded page slug (e.g. "%2F" for the home page "/"),
// not the internal page id — see app/pages/admin/pages/[slug].vue.
export default defineEventHandler(async (event): Promise<PageRecord> => {
	const rawSlug = getRouterParam(event, 'slug')
	if (!rawSlug) {
		throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
	}
	const slug = decodeURIComponent(rawSlug)

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('pages')
		.select('id, slug, title, blocks, seo, updated_at, updated_by, updater:profiles(name)')
		.eq('slug', slug)
		.maybeSingle()

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: 'Page not found' })
	}

	// Without generated Supabase types, the client can't infer that
	// updated_by -> profiles is a to-one relationship, so it types (and
	// sometimes returns) `updater` as an array — normalize either way.
	const updater = Array.isArray(data.updater) ? (data.updater[0] ?? null) : data.updater

	return { ...data, updater } as PageRecord
})
