import type { PageSummary } from '#shared/types/cms'

export default defineEventHandler(async (event): Promise<PageSummary[]> => {
	await requireAdminSession(event)

	const supabase = useSupabase()
	const { data, error } = await supabase
		.from('pages')
		.select('id, slug, title, seo, updated_at, updated_by, updater:profiles(name)')
		.order('updated_at', { ascending: false })

	if (error) {
		throw createError({ statusCode: 500, statusMessage: error.message })
	}

	// Without generated Supabase types, the client can't infer that
	// updated_by -> profiles is a to-one relationship, so it types (and
	// sometimes returns) `updater` as an array — normalize either way.
	const normalized = (data ?? []).map((page) => ({
		...page,
		updater: Array.isArray(page.updater) ? (page.updater[0] ?? null) : page.updater,
	}))

	return normalized as PageSummary[]
})
